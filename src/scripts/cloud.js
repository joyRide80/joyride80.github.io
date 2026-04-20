/**
 * Cloud & Timeline view — GSAP-powered interactive project canvas
 * Inspired by aletagency.com scattered layout
 */

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { compareProjectsChronological } from "../lib/projectYear.ts";
import { isVideoAssetPath } from "../lib/media.ts";

gsap.registerPlugin(SplitText);

document.addEventListener("DOMContentLoaded", () => {
  const projects = window.__PROJECTS__ || [];
  if (!projects.length) return;
  const basePrefix = (window.__BASE_URL__ || "/").replace(/\/$/, "");

  function normalizeAssetPath(path) {
    if (!path) return path;
    if (!basePrefix) return path;
    if (
      /^(https?:)?\/\//.test(path) ||
      path.startsWith("data:") ||
      path.startsWith("blob:")
    ) {
      return path;
    }
    if (path.startsWith(`${basePrefix}/`)) return path;
    if (path.startsWith("/")) return basePrefix + path;
    return path;
  }

  const cloudCanvas = document.getElementById("cloud-canvas");
  const timelineTrack = document.getElementById("timeline-track");
  const cloudView = document.getElementById("cloud-view");
  const timelineView = document.getElementById("timeline-view");
  const overlay = document.getElementById("project-overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlaySubtitle = document.getElementById("overlay-subtitle");
  const switchTrack = document.getElementById("switch-track");
  const switchLabels = document.querySelectorAll(".switch__label");
  const cloudEnabled = false;

  /** First N intro strip stills to preload before intro reveals the page. */
  const STRIP_EAGER_TILE_COUNT = 6;
  const STRIP_PRELOAD_TIMEOUT_MS = 3500;

  let activeView = "timeline";
  let isDragging = false;
  let dragStartX = 0;
  let canvasStartX = 0;
  let currentCanvasX = 0;
  let introFinished = false;
  /** Timeline DOM is built on first switch to timeline (saves bandwidth + main thread). */
  let timelineRendered = false;
  /** Skip full cloud re-render on resize unless layout band changes (avoids canceling media fetches). */
  let lastCloudLayoutBucket = null;
  /** Skip timeline rebuild on resize unless tile width band changes. */
  let lastTimelineTileBucket = null;

  function cloudLayoutBucket() {
    const w = window.innerWidth;
    if (w < 768) return "m";
    if (w < 1024) return "t";
    if (w >= 1400) return "x";
    return "d";
  }

  function timelineTileBucketPx() {
    const w = window.innerWidth;
    if (w < 768) return 140;
    if (w >= 1400) return 220;
    return 200;
  }

  /** Drop IntersectionObservers on strip videos before DOM teardown. */
  function disconnectStripVideoObservers(root) {
    if (!root) return;
    root.querySelectorAll("video").forEach((v) => {
      if (v._stripVideoIo) {
        v._stripVideoIo.disconnect();
        v._stripVideoIo = null;
      }
    });
  }

  /**
   * Load Pantasia for SplitText metrics only — avoids document.fonts.ready (all faces).
   * Family is fixed: computed style can still report a fallback before Pantasia applies.
   */
  function waitForIntroDisplayFont(introTextEl) {
    if (!introTextEl || typeof document.fonts?.load !== "function") {
      return Promise.resolve();
    }
    const cs = getComputedStyle(introTextEl);
    const weight = cs.fontWeight || "400";
    const size = cs.fontSize || "56px";
    const spec = `${weight} ${size} Pantasia`;
    const timeoutMs = 700;
    return Promise.race([
      document.fonts.load(spec).catch(() => undefined),
      new Promise((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  }

  /**
   * @param {HTMLElement} container
   * @param {string} src
   * @param {string} altText
   * @param {{
   *   autoplayVideo?: boolean;
   *   imgLoading?: "lazy" | "eager";
   *   imgFetchPriority?: "high" | "low" | "auto";
   *   deferStripVideoUntilVisible?: boolean;
   *   stripIoRoot?: Element | null;
   * }} [opts] deferStripVideoUntilVisible: default true — autoplay strip videos only while in view.
   * stripIoRoot: IO root (cloud uses #cloud-view; timeline must use null = viewport).
   */
  function appendCoverMedia(container, src, altText, opts = {}) {
    const autoplayVideo = opts.autoplayVideo !== false;
    const deferStripVideo =
      opts.deferStripVideoUntilVisible !== false &&
      typeof IntersectionObserver === "function";
    const normalizedSrc = normalizeAssetPath(src);
    if (isVideoAssetPath(src)) {
      const v = document.createElement("video");
      v.style.opacity = "0";
      v.style.transition = "opacity 0.4s ease";
      let revealed = false;
      const revealVideo = () => {
        if (revealed) return;
        revealed = true;
        window.clearTimeout(failOpenTimer);
        v.style.opacity = "1";
        setTimeout(() => {
          v.style.transition = "";
        }, 400);
      };
      const failOpenTimer = window.setTimeout(() => revealVideo(), 4500);
      // Some browsers may delay `loadeddata` for muted/autoplay thumbnails.
      // Reveal on metadata too so the tile doesn't stay invisible.
      v.addEventListener("loadedmetadata", revealVideo, { once: true });
      v.addEventListener("loadeddata", revealVideo, { once: true });
      v.addEventListener("error", revealVideo, { once: true });
      v.src = normalizedSrc;
      v.muted = true;
      v.loop = autoplayVideo;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      if (altText) v.setAttribute("aria-label", altText);
      container.appendChild(v);
      if (v.readyState >= 2) revealVideo();

      if (autoplayVideo && deferStripVideo) {
        v.preload = "metadata";
        v.autoplay = false;
        const ioRoot = opts.stripIoRoot !== undefined ? opts.stripIoRoot : null;
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((ent) => {
              // Any visible intersection counts — ratio alone misses tiles covered by siblings.
              if (ent.isIntersecting) {
                v.preload = "auto";
                v.play().catch(() => {});
              } else {
                v.pause();
              }
            });
          },
          {
            root: ioRoot,
            rootMargin: "80px",
            threshold: [0, 0.01, 0.15],
          },
        );
        io.observe(container);
        v._stripVideoIo = io;
      } else {
        v.preload = autoplayVideo ? "auto" : "metadata";
        v.autoplay = autoplayVideo;
        if (autoplayVideo) v.play().catch(() => {});
      }
      return;
    }
    const img = document.createElement("img");
    img.style.opacity = "0";
    img.style.transition = "opacity 0.4s ease";
    img.decoding = "async";
    if (opts.imgFetchPriority) {
      img.fetchPriority = opts.imgFetchPriority;
    }
    img.onload = () => {
      img.style.opacity = "1";
      setTimeout(() => {
        img.style.transition = "";
      }, 400);
    };
    // Ensure already cached images also show up
    if (img.complete) {
      img.style.opacity = "1";
      img.style.transition = "";
    }
    img.src = normalizedSrc;
    img.alt = altText || "";
    img.loading = opts.imgLoading || "lazy";
    container.appendChild(img);
  }

  // ============================================================
  // Seed-based pseudo-random for consistent layouts
  // ============================================================
  function seededRandom(seed) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  // ============================================================
  // Generate cloud positions — cluster by project
  // ============================================================
  function rectsOverlap(a, b, gap) {
    return !(
      a.x + a.w + gap <= b.x ||
      b.x + b.w + gap <= a.x ||
      a.y + a.h + gap <= b.y ||
      b.y + b.h + gap <= a.y
    );
  }

  /** Dedupe strip URLs so the cloud never shows the same asset twice for one project. */
  function dedupeHomeStripUrls(urls) {
    const seen = new Set();
    const out = [];
    for (const u of urls) {
      if (!u) continue;
      const key = normalizeAssetPath(u);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(key);
    }
    return out;
  }

  /**
   * Cloud-only pool: dedupe, then stills before videos. The first tile (only tile on mobile)
   * must not be a deferred strip video, or the whole cluster can look empty (opacity 0 until IO/decode).
   */
  function cloudStripPool(urls) {
    const deduped = dedupeHomeStripUrls(urls);
    if (!deduped.length) return [];
    const stills = deduped.filter((u) => !isVideoAssetPath(u));
    const videos = deduped.filter((u) => isVideoAssetPath(u));
    return [...stills, ...videos];
  }

  /**
   * Same sources as the home strip, plus thumbnail + hero `src` fallbacks so a project always
   * gets stills in the pool (avoids a lone deferred MP4 tile reading as “missing”).
   */
  function getCloudMediaPool(project) {
    const raw = [];
    if (Array.isArray(project.thumbnailImages)) {
      for (const u of project.thumbnailImages) {
        if (u && String(u).trim()) raw.push(String(u).trim());
      }
    }
    const thumb = project.thumbnail && String(project.thumbnail).trim();
    if (thumb) raw.push(thumb);
    if (Array.isArray(project.heroImages)) {
      for (const h of project.heroImages) {
        const s = h?.src && String(h.src).trim();
        if (s) raw.push(s);
      }
    }
    return cloudStripPool(raw);
  }

  /**
   * Cloud layout: one ring slot per project; up to 2–3 tiles on desktop when the project has
   * that many *distinct* `thumbnailImages` (1 on mobile). Each tile uses a different URL — no duplicates.
   */
  function generateCloudPositions() {
    // Use actual cloud container bounds, not full viewport
    const containerRect = cloudCanvas
      ? cloudCanvas.parentElement.getBoundingClientRect()
      : null;
    const viewW = containerRect ? containerRect.width : window.innerWidth;
    const viewH = containerRect ? containerRect.height : window.innerHeight;
    const centerX = viewW * 0.5;
    const centerY = viewH * 0.5;
    const gap = 12;
    const isMobile = viewW < 768;
    const isTablet = viewW >= 768 && viewW < 1024;
    const isXxl = viewW >= 1400;
    const sizeScale = isMobile ? 0.55 : isTablet ? 0.75 : isXxl ? 1.12 : 1;

    const totalProjects = projects.length;
    const items = [];
    let seed = 42;

    // Exclusion zone so cloud images never overlap the center slogan
    const sloganCanvasY =
      window.innerHeight / 2 - (containerRect ? containerRect.top : 120);
    const exW = isMobile ? 280 : 500;
    const exH = isMobile ? 180 : 300;
    items.push({
      x: centerX - exW / 2,
      y: sloganCanvasY - exH / 2,
      w: exW,
      h: exH,
      _exclusion: true,
    });

    projects.forEach((project, pIndex) => {
      const pool = getCloudMediaPool(project);
      if (!pool.length) return;

      const angle = (pIndex / totalProjects) * Math.PI * 2 - Math.PI / 2;
      const radius = Math.min(viewW, viewH) * (isMobile ? 0.35 : 0.28);
      const clusterCX = centerX + Math.cos(angle) * radius;
      const clusterCY = centerY + Math.sin(angle) * radius * 0.6;

      const maxTilesDesktop = 2 + Math.floor(seededRandom(seed++) * 2);
      const imageCount = isMobile ? 1 : Math.min(maxTilesDesktop, pool.length);
      const baseSizes = [
        { w: 140, h: 140 },
        { w: 180, h: 180 },
        { w: 160, h: 130 },
        { w: 200, h: 170 },
      ];
      const sizes = baseSizes.map((s) => ({
        w: Math.round(s.w * sizeScale),
        h: Math.round(s.h * sizeScale),
      }));

      for (let i = 0; i < imageCount; i++) {
        const size = sizes[Math.floor(seededRandom(seed++) * sizes.length)];
        const spread = isMobile ? 0.5 : 1;
        const offsetX = (seededRandom(seed++) - 0.5) * 120 * spread;
        const offsetY = (seededRandom(seed++) - 0.5) * 80 * spread;
        seed++;

        let x = clusterCX + offsetX - size.w / 2;
        let y = clusterCY + offsetY - size.h / 2;
        const candidate = { x, y, w: size.w, h: size.h };

        let attempts = 0;
        while (attempts < 60) {
          let collides = false;
          // Check bounds to ensure items stay within the visible cloud area
          if (
            candidate.x < gap ||
            candidate.y < gap ||
            candidate.x + candidate.w > viewW - gap ||
            candidate.y + candidate.h > viewH - gap
          ) {
            collides = true;
          } else {
            for (const placed of items) {
              if (rectsOverlap(candidate, placed, gap)) {
                collides = true;
                break;
              }
            }
          }
          if (!collides) break;
          const nudgeAngle = seededRandom(seed++) * Math.PI * 2;
          const nudgeDist = 20 + seededRandom(seed++) * 30;
          candidate.x += Math.cos(nudgeAngle) * nudgeDist;
          candidate.y += Math.sin(nudgeAngle) * nudgeDist;
          attempts++;
        }

        // Clamp to container bounds so it never bleeds out (which looks like it's cut off)
        candidate.x = Math.max(
          gap,
          Math.min(candidate.x, viewW - candidate.w - gap),
        );
        candidate.y = Math.max(
          gap,
          Math.min(candidate.y, viewH - candidate.h - gap),
        );

        const pick = pool[i];
        items.push({
          project,
          slug: project.slug,
          src: pick,
          x: candidate.x,
          y: candidate.y,
          w: size.w,
          h: size.h,
        });
      }
    });

    // Force any items still overlapping the exclusion zone outward
    const exclusion = items.find((i) => i._exclusion);
    if (exclusion) {
      const exCX = exclusion.x + exclusion.w / 2;
      const exCY = exclusion.y + exclusion.h / 2;

      items.forEach((item) => {
        if (item._exclusion) return;
        if (!rectsOverlap(item, exclusion, gap)) return;

        const itemCX = item.x + item.w / 2;
        const itemCY = item.y + item.h / 2;
        let dx = itemCX - exCX;
        let dy = itemCY - exCY;
        if (dx === 0 && dy === 0) dx = 1;
        const angle = Math.atan2(dy, dx);
        const dist =
          Math.max(exclusion.w, exclusion.h) / 2 +
          Math.max(item.w, item.h) / 2 +
          gap;
        item.x = exCX + Math.cos(angle) * dist - item.w / 2;
        item.y = exCY + Math.sin(angle) * dist - item.h / 2;

        // Clamp to ensure it doesn't get pushed out of bounds by exclusion
        item.x = Math.max(gap, Math.min(item.x, viewW - item.w - gap));
        item.y = Math.max(gap, Math.min(item.y, viewH - item.h - gap));
      });
    }

    return items.filter((item) => !item._exclusion);
  }

  /**
   * Pick intro preload stills from project media pools without depending on cloud layout.
   * Pass 1 picks one still per project; pass 2 fills remaining slots from leftover stills.
   */
  function getIntroPreloadUrls(limit = STRIP_EAGER_TILE_COUNT) {
    const max = Math.max(0, Number(limit) || 0);
    if (!max) return [];

    const chosen = [];
    const seen = new Set();
    const stillPools = projects.map((project) =>
      getCloudMediaPool(project).filter((u) => u && !isVideoAssetPath(u)),
    );

    const addUrl = (rawUrl) => {
      const normalized = normalizeAssetPath(rawUrl);
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      chosen.push(normalized);
      return true;
    };

    // First pass: one representative still per project.
    stillPools.forEach((pool) => {
      if (chosen.length >= max || !pool.length) return;
      addUrl(pool[0]);
    });

    // Second pass: fill remaining slots from the rest of each pool.
    if (chosen.length < max) {
      stillPools.forEach((pool) => {
        if (chosen.length >= max || pool.length < 2) return;
        for (let i = 1; i < pool.length && chosen.length < max; i += 1) {
          addUrl(pool[i]);
        }
      });
    }

    return chosen.slice(0, max);
  }

  /**
   * Preload a URL list and report ratio progress.
   * @param {string[]} urls
   * @param {(ratio: number) => void} [onProgress] 0–1 per decoded still (deduped list).
   * @param {number} [timeoutMs]
   */
  function preloadStillUrls(
    urls,
    onProgress,
    timeoutMs = STRIP_PRELOAD_TIMEOUT_MS,
  ) {
    const unique = [...new Set((urls || []).filter(Boolean))];
    if (!unique.length) {
      onProgress?.(1);
      return Promise.resolve();
    }

    let done = 0;
    const bump = () => {
      done += 1;
      onProgress?.(Math.min(1, done / unique.length));
    };

    const loadOne = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          bump();
          resolve();
        };
        img.onerror = () => {
          bump();
          resolve();
        };
        img.src = src;
      });

    const loadAll = Promise.all(unique.map(loadOne)).then(() => {
      onProgress?.(1);
    });

    const timeout = new Promise((resolve) => {
      setTimeout(() => {
        onProgress?.(1);
        resolve();
      }, timeoutMs);
    });

    return Promise.race([loadAll, timeout]);
  }

  /**
   * Preload still (non-video) URLs for intro strip imagery.
   * Videos are excluded; they load via `<video>` after reveal.
   */
  function preloadFirstCloudStripStills() {
    const urls = getIntroPreloadUrls(STRIP_EAGER_TILE_COUNT);
    return preloadStillUrls(urls, undefined, STRIP_PRELOAD_TIMEOUT_MS);
  }

  // ============================================================
  // Render cloud items
  // ============================================================
  function renderCloud() {
    if (!cloudCanvas) return;
    disconnectStripVideoObservers(cloudCanvas);
    // Clear existing items (keep tagline)
    cloudCanvas.querySelectorAll(".cloud__item").forEach((el) => el.remove());

    const items = generateCloudPositions();

    items.forEach((item, i) => {
      const el = document.createElement("div");
      el.className = "cloud__item";
      el.dataset.slug = item.slug;
      el.style.left = `${item.x}px`;
      el.style.top = `${item.y}px`;
      el.style.width = `${item.w}px`;
      el.style.height = `${item.h}px`;
      el.style.zIndex = String(i);

      if (introFinished) {
        el.style.opacity = "1";
        el.style.transform = "scale(1)";
      }

      const eager = i < STRIP_EAGER_TILE_COUNT;
      appendCoverMedia(el, item.src, item.project.title, {
        autoplayVideo: true,
        deferStripVideoUntilVisible: true,
        stripIoRoot: cloudView,
        imgLoading: "eager",
        imgFetchPriority: eager ? "high" : "low",
      });

      el.addEventListener("mouseenter", () => handleItemHover(item, el));
      el.addEventListener("mouseleave", handleItemLeave);
      el.addEventListener("click", () => {
        if (!isDragging) {
          const baseUrl = window.__BASE_URL__ || "/";
          window.location.href = `${baseUrl.replace(/\/$/, "")}/projects/${item.slug}`;
        }
      });

      cloudCanvas.appendChild(el);
    });
  }

  // ============================================================
  // Render timeline items — 1 image per project, configurable pick
  // ============================================================
  /** Must match `.timeline__item` horizontal padding in global.css (px). */
  const TIMELINE_ITEM_PADDING = 24;

  function isTimelineGridMode() {
    return window.innerWidth <= 1024;
  }

  /** Caps portrait-tall tiles; landscape heights stay unchanged (below this). */
  function timelineItemMaxOuterHeightPx() {
    const vh =
      typeof window !== "undefined" && window.innerHeight > 0
        ? window.innerHeight
        : 900;
    return Math.min(280, Math.max(240, Math.round(vh * 0.4)));
  }

  function capTimelineOuterHeight(outerH) {
    return Math.min(outerH, timelineItemMaxOuterHeightPx());
  }

  function timelineInnerWidth(tileW) {
    return Math.max(1, tileW - 2 * TIMELINE_ITEM_PADDING);
  }

  function syncTimelineCoverMediaSize(el) {
    if (isTimelineGridMode()) {
      el.dataset.baseW = "";
      el.dataset.baseH = "";
      el.style.width = "";
      el.style.height = "";
      return;
    }

    const tileW = el._timelineTileW;
    if (!tileW) return;
    const media = el.querySelector(":scope > img, :scope > video");
    if (!media) return;
    let nw = 0;
    let nh = 0;
    if (media.tagName === "IMG") {
      nw = media.naturalWidth;
      nh = media.naturalHeight;
    } else if (media.tagName === "VIDEO") {
      nw = media.videoWidth;
      nh = media.videoHeight;
    }
    if (!nw || !nh) return;
    const innerW = timelineInnerWidth(tileW);
    const innerH = Math.max(1, Math.round((innerW * nh) / nw));
    const outerH = capTimelineOuterHeight(innerH + 2 * TIMELINE_ITEM_PADDING);
    el.dataset.baseW = String(tileW);
    el.dataset.baseH = String(outerH);
    el.style.width = `${tileW}px`;
    el.style.height = `${outerH}px`;
  }

  function bindTimelineCoverMediaResize(el) {
    const media = el.querySelector(":scope > img, :scope > video");
    if (!media) return;
    const onDecodable = () => syncTimelineCoverMediaSize(el);
    media.addEventListener("load", onDecodable);
    media.addEventListener("loadedmetadata", onDecodable);
    syncTimelineCoverMediaSize(el);
  }

  function renderTimeline() {
    if (!timelineTrack) return;
    disconnectStripVideoObservers(timelineTrack);
    timelineTrack.innerHTML = "";

    const sorted = [...projects].sort(compareProjectsChronological);
    const isGrid = isTimelineGridMode();
    const isMobile = window.innerWidth < 768;
    const isXxl = window.innerWidth >= 1400;
    /** Equal width for every tile; image height follows intrinsic aspect (no crop). */
    const tileW = isMobile ? 140 : isXxl ? 220 : 200;

    timelineView?.classList.toggle("timeline--grid", isGrid);

    sorted.forEach((project, timelineIdx) => {
      const pool = (project.thumbnailImages || []).filter(Boolean);
      if (!pool.length) return;

      const coverSrc = normalizeAssetPath(pool[0]);

      /** Scroll anchors to the end — prioritize the last few tiles. */
      const fromEnd = sorted.length - 1 - timelineIdx;
      const eager = fromEnd < 5;

      const el = document.createElement("div");
      el.className = "timeline__item";
      el.dataset.slug = project.slug;
      el._timelineTileW = isGrid ? null : tileW;

      if (!isGrid) {
        const innerW = timelineInnerWidth(tileW);
        const provisionalInnerH = Math.round((innerW * 5) / 4);
        const provisionalH = capTimelineOuterHeight(
          provisionalInnerH + 2 * TIMELINE_ITEM_PADDING,
        );
        el.dataset.baseW = String(tileW);
        el.dataset.baseH = String(provisionalH);
        el.style.width = `${tileW}px`;
        el.style.height = `${provisionalH}px`;
      }
      appendCoverMedia(el, coverSrc, project.title, {
        autoplayVideo: true,
        deferStripVideoUntilVisible: true,
        imgLoading: eager ? "eager" : "lazy",
        imgFetchPriority: eager ? "high" : "low",
      });
      bindTimelineCoverMediaResize(el);

      el.addEventListener("mouseenter", () => handleTimelineHover(project, el));
      el.addEventListener("mouseleave", handleTimelineLeave);
      el.addEventListener("click", () => {
        const baseUrl = window.__BASE_URL__ || "/";
        window.location.href = `${baseUrl.replace(/\/$/, "")}/projects/${project.slug}`;
      });

      timelineTrack.appendChild(el);
    });
  }

  function getTimelineMediaElements(el) {
    return Array.from(el.querySelectorAll(":scope > img, :scope > video"));
  }

  function handleTimelineHover(project, hoveredEl) {
    if (isTimelineGridMode()) {
      showOverlay(project);
      return;
    }

    const items = Array.from(timelineTrack.querySelectorAll(".timeline__item"));
    const hoveredIndex = items.indexOf(hoveredEl);

    items.forEach((el, i) => {
      const baseW = Number(el.dataset.baseW);
      const baseH = Number(el.dataset.baseH);
      const distance = Math.abs(i - hoveredIndex);
      let factor = 1;
      if (distance === 0) factor = 1.15;
      else if (distance === 1) factor = 1.06;
      else if (distance === 2) factor = 1.02;

      gsap.to(el, {
        width: Math.round(baseW * factor),
        height: Math.round(baseH * factor),
        duration: 0.4,
        ease: "power2.out",
      });
    });

    getTimelineMediaElements(hoveredEl).forEach((m) => {
      gsap.to(m, {
        scale: 1.08,
        duration: 0.45,
        ease: "power2.out",
        transformOrigin: "50% 50%",
      });
    });
    showOverlay(project);
  }

  function handleTimelineLeave() {
    if (isTimelineGridMode()) {
      hideOverlay();
      return;
    }

    const items = timelineTrack.querySelectorAll(".timeline__item");
    items.forEach((el) => {
      getTimelineMediaElements(el).forEach((m) => {
        gsap.to(m, {
          scale: 1,
          duration: 0.45,
          ease: "power2.out",
        });
      });
      gsap.to(el, {
        width: Number(el.dataset.baseW),
        height: Number(el.dataset.baseH),
        duration: 0.4,
        ease: "power2.out",
      });
    });
    hideOverlay();
  }

  // ============================================================
  // Hover handlers
  // ============================================================
  function handleItemHover(item, el) {
    const slug = item.slug;

    // Same-project tiles get active z-index; all tiles stay full opacity for legibility
    document.querySelectorAll(".cloud__item").forEach((cloud) => {
      if (cloud.dataset.slug === slug) {
        gsap.to(cloud, { opacity: 1, duration: 0.3, ease: "power2.out" });
        cloud.classList.add("cloud__item--active");
        cloud.classList.remove("cloud__item--dimmed");
      } else {
        gsap.to(cloud, { opacity: 1, duration: 0.3, ease: "power2.out" });
        cloud.classList.add("cloud__item--dimmed");
        cloud.classList.remove("cloud__item--active");
      }
    });

    showOverlay(item.project);
  }

  function handleItemLeave() {
    document.querySelectorAll(".cloud__item").forEach((el) => {
      gsap.to(el, { opacity: 1, duration: 0.3, ease: "power2.out" });
      el.classList.remove("cloud__item--active", "cloud__item--dimmed");
    });
    hideOverlay();
  }

  // ============================================================
  // Overlay
  // ============================================================
  function showOverlay(project) {
    if (!overlay || !overlayTitle || !overlaySubtitle) return;

    overlayTitle.textContent = project.title || "";
    overlaySubtitle.textContent = project.subtitle || project.headline || "";

    gsap.killTweensOf(overlay);
    gsap.fromTo(
      overlay,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "power2.out",
      },
    );
  }

  function hideOverlay() {
    if (!overlay) return;
    gsap.killTweensOf(overlay);
    gsap.to(overlay, {
      opacity: 0,
      y: 10,
      duration: 0.25,
      ease: "power2.in",
    });
  }

  // ============================================================
  // Drag / Pan for cloud view
  // ============================================================
  function initDrag() {
    if (!cloudCanvas || !cloudView) return;

    cloudView.addEventListener("mousedown", (e) => {
      isDragging = false;
      dragStartX = e.clientX;
      canvasStartX = currentCanvasX;
      cloudView.style.cursor = "grabbing";

      const onMove = (e) => {
        const dx = e.clientX - dragStartX;
        if (Math.abs(dx) > 5) isDragging = true;
        currentCanvasX = canvasStartX + dx;
        gsap.set(cloudCanvas, { x: currentCanvasX });
      };

      const onUp = () => {
        cloudView.style.cursor = "grab";
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        setTimeout(() => {
          isDragging = false;
        }, 50);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    });

    cloudView.addEventListener(
      "touchstart",
      (e) => {
        const touch = e.touches[0];
        isDragging = false;
        dragStartX = touch.clientX;
        canvasStartX = currentCanvasX;
      },
      { passive: true },
    );

    cloudView.addEventListener(
      "touchmove",
      (e) => {
        const touch = e.touches[0];
        const dx = touch.clientX - dragStartX;
        if (Math.abs(dx) > 5) isDragging = true;
        currentCanvasX = canvasStartX + dx;
        gsap.set(cloudCanvas, { x: currentCanvasX });
      },
      { passive: true },
    );

    cloudView.addEventListener("touchend", () => {
      setTimeout(() => {
        isDragging = false;
      }, 50);
    });
  }

  // ============================================================
  // View switching
  // ============================================================
  function ensureTimelineRendered() {
    if (timelineRendered || !timelineTrack) return;
    renderTimeline();
    lastTimelineTileBucket = timelineTileBucketPx();
    timelineRendered = true;
  }

  function scrollTimelineToEnd() {
    if (!timelineView) return;
    const apply = () => {
      const max = timelineView.scrollWidth - timelineView.clientWidth;
      if (max > 0) timelineView.scrollLeft = max;
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(apply);
    });
    setTimeout(apply, 50);
    setTimeout(apply, 300);
  }

  function switchView(view, opts = {}) {
    const shouldEnsureTimeline = opts.ensureTimeline !== false;
    activeView = view;
    if (switchTrack) switchTrack.dataset.active = view;
    hideOverlay();

    const sloganEl = document.getElementById("slogan");
    const homeRoot = document.getElementById("home");

    if (view === "cloud") {
      homeRoot?.classList.remove("home--timeline-active");
      cloudView.style.display = "block";
      timelineView.classList.remove("is-active");
      gsap.fromTo(cloudView, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      if (sloganEl) gsap.to(sloganEl, { opacity: 1, duration: 0.3 });
    } else {
      homeRoot?.classList.add("home--timeline-active");
      if (shouldEnsureTimeline) ensureTimelineRendered();
      cloudView.style.display = "none";
      timelineView.classList.add("is-active");
      gsap.fromTo(timelineView, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      if (shouldEnsureTimeline) scrollTimelineToEnd();
      if (sloganEl) gsap.to(sloganEl, { opacity: 0, duration: 0.3 });
    }
  }

  // Switch click handlers
  switchLabels.forEach((label) => {
    label.addEventListener("click", () => {
      switchView(label.dataset.view);
    });
  });

  if (switchTrack) {
    switchTrack.addEventListener("click", () => {
      switchView(activeView === "cloud" ? "timeline" : "cloud");
    });
  }

  // ============================================================
  // Intro animation — page reveal
  // ============================================================

  const INTRO_KEY = "joy__intro_played";
  const isFirstVisit = !sessionStorage.getItem(INTRO_KEY);

  function playIntro() {
    const homeEl = document.getElementById("home");
    const logo = document.getElementById("site-logo");
    const nav = document.getElementById("main-nav");
    const bio = document.getElementById("home-bio");
    const switchEl = document.querySelector(".home__switch");
    const contactEl = document.querySelector(".global-contact");
    const cloudItems = Array.from(document.querySelectorAll(".cloud__item"));

    const sloganEl = document.getElementById("slogan");
    const introSlogan = document.getElementById("intro-slogan");
    const introSloganText = document.getElementById("intro-slogan-text");

    const chromeEls = [logo, nav, bio, switchEl, contactEl].filter(Boolean);
    if (activeView === "cloud" && sloganEl) chromeEls.push(sloganEl);

    gsap.set(chromeEls, {
      opacity: 0,
    });
    if (activeView !== "cloud" && sloganEl) {
      gsap.set(sloganEl, { opacity: 0 });
    }
    gsap.set(cloudItems, {
      opacity: 0,
      scale: 0.8,
      transformOrigin: "center center",
    });

    const shuffled = [...cloudItems].sort(() => Math.random() - 0.5);
    const third = Math.ceil(shuffled.length / 3);
    const group1 = shuffled.slice(0, third);
    const group2 = shuffled.slice(third, third * 2);
    const group3 = shuffled.slice(third * 2);

    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        if (activeView === "timeline") {
          ensureTimelineRendered();
          scrollTimelineToEnd();
        }
        introFinished = true;
        homeEl?.setAttribute("aria-busy", "false");
        try {
          sessionStorage.setItem(INTRO_KEY, "1");
        } catch {
          /* private mode / quota */
        }
      },
    });

    /** Shared tail: reveal chrome + cloud after intro overlay. */
    function addIntroRevealTweens(revealLabel) {
      tl.addLabel(revealLabel);
      tl.to(
        chromeEls,
        {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
        },
        revealLabel,
      );
      tl.to(
        group1,
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.04,
        },
        `${revealLabel}+=0.1`,
      );
      tl.to(
        group2,
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.04,
        },
        "-=0.45",
      );
      tl.to(
        group3,
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.04,
        },
        "-=0.4",
      );
    }

    if (isFirstVisit && introSlogan && introSloganText) {
      gsap.set(introSlogan, { opacity: 1 });
      gsap.set(introSloganText, { opacity: 1 });

      const runIntroAfterFonts = () => {
        homeEl?.setAttribute("aria-busy", "true");
        const revealLabel = "revealSite";
        try {
          const split = SplitText.create(introSloganText, {
            type: "words,lines",
            linesClass: "intro-line",
            mask: "lines",
            autoSplit: true,
          });

          const lines = split.lines;
          if (!lines?.length) {
            split.revert();
            throw new Error("SplitText produced no lines");
          }

          gsap.set(split.lines, { transformOrigin: "50% 100%" });

          const line1Duration = 0.65;
          const line2Duration = 1.05;
          const pauseAfterLine1 = 0.22;

          if (lines[0]) {
            tl.from(lines[0], {
              duration: line1Duration,
              yPercent: 100,
              opacity: 0,
              ease: "expo.out",
            });
          }
          if (lines[1]) {
            tl.from(
              lines[1],
              {
                duration: line2Duration,
                yPercent: 100,
                opacity: 0,
                ease: "expo.out",
              },
              `>${pauseAfterLine1}`,
            );
          }
          for (let i = 2; i < lines.length; i++) {
            tl.from(
              lines[i],
              {
                duration: 0.75,
                yPercent: 100,
                opacity: 0,
                ease: "expo.out",
              },
              ">0.1",
            );
          }

          tl.call(() => {
            preloadFirstCloudStripStills();
          });

          tl.to(
            split.lines,
            {
              opacity: 0,
              duration: 0.55,
              ease: "power2.inOut",
            },
            ">+0.2",
          );

          tl.to(introSlogan, {
            opacity: 0,
            duration: 0.35,
            ease: "power2.out",
          });

          tl.call(() => split.revert());

          addIntroRevealTweens(revealLabel);
        } catch {
          homeEl?.setAttribute("aria-busy", "true");
          tl.fromTo(
            introSloganText,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" },
          );
          tl.to({}, { duration: 0.55 });
          tl.call(() => {
            preloadFirstCloudStripStills();
          });
          tl.to(introSloganText, {
            opacity: 0,
            duration: 0.45,
            ease: "power2.in",
          });
          tl.to(
            introSlogan,
            { opacity: 0, duration: 0.35, ease: "power2.out" },
            "<0.15",
          );
          addIntroRevealTweens(revealLabel);
        }

        tl.play();
      };

      waitForIntroDisplayFont(introSloganText)
        .then(() => {
          requestAnimationFrame(runIntroAfterFonts);
        })
        .catch(() => {
          requestAnimationFrame(runIntroAfterFonts);
        });
    } else {
      homeEl?.setAttribute("aria-busy", "true");
      // Repeat visits favor instant reveal; do not block on preload.
      preloadFirstCloudStripStills();
      tl.to(chromeEls, {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
      });
      tl.to(
        group1,
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.04,
        },
        "-=0.4",
      );
      tl.to(
        group2,
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.04,
        },
        "-=0.45",
      );
      tl.to(
        group3,
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.04,
        },
        "-=0.4",
      );
    }

    // Repeat visits: do not wait on unrelated webfonts
    if (!(isFirstVisit && introSlogan && introSloganText)) {
      requestAnimationFrame(() => tl.play());
    }
  }

  // ============================================================
  // Init
  // ============================================================
  if (cloudEnabled) {
    renderCloud();
    lastCloudLayoutBucket = cloudLayoutBucket();
    initDrag();
  } else {
    if (cloudView) cloudView.style.display = "none";
    const sloganEl = document.getElementById("slogan");
    if (sloganEl) gsap.set(sloganEl, { opacity: 0 });
  }
  switchView("timeline", { ensureTimeline: false });
  playIntro();

  // Recalculate on resize only when layout bands change (full re-render cancels in-flight video)
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const cloudBucket = cloudLayoutBucket();
      if (cloudEnabled && cloudBucket !== lastCloudLayoutBucket) {
        lastCloudLayoutBucket = cloudBucket;
        renderCloud();
      }
      if (timelineRendered) {
        const tileBucket = timelineTileBucketPx();
        if (tileBucket !== lastTimelineTileBucket) {
          lastTimelineTileBucket = tileBucket;
          renderTimeline();
          if (activeView === "timeline") scrollTimelineToEnd();
        }
      }
    }, 250);
  });
});
