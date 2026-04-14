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

  let activeView = "cloud";
  let isDragging = false;
  let dragStartX = 0;
  let canvasStartX = 0;
  let currentCanvasX = 0;
  let introFinished = false;

  // ============================================================
  // Image cycle effect — preloading & state
  // ============================================================
  const preloadedImages = new Map();

  function getProjectImagePool(project) {
    const pool = [];
    if (project.heroImages?.length) {
      project.heroImages.forEach((img) => {
        if (img.src) pool.push(normalizeAssetPath(img.src));
      });
    }
    const normalizedThumb = normalizeAssetPath(project.thumbnail);
    if (normalizedThumb && !pool.includes(normalizedThumb)) {
      pool.push(normalizedThumb);
    }
    return pool;
  }

  function preloadAllProjectImages() {
    projects.forEach((project) => {
      const pool = getProjectImagePool(project);
      pool.forEach((src) => {
        if (isVideoAssetPath(src)) return;
        if (!preloadedImages.has(src)) {
          const img = new Image();
          img.src = src;
          preloadedImages.set(src, img);
        }
      });
    });
  }

  function appendCoverMedia(container, src, altText) {
    const normalizedSrc = normalizeAssetPath(src);
    if (isVideoAssetPath(src)) {
      const v = document.createElement("video");
      v.style.opacity = "0";
      v.style.transition = "opacity 0.4s ease";
      v.addEventListener("loadeddata", () => {
        v.style.opacity = "1";
        setTimeout(() => {
          v.style.transition = "";
        }, 400);
      });
      if (v.readyState >= 2) {
        v.style.opacity = "1";
        v.style.transition = "";
      }
      v.src = normalizedSrc;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.autoplay = true;
      if (altText) v.setAttribute("aria-label", altText);
      container.appendChild(v);
      v.play().catch(() => {});
      return;
    }
    const img = document.createElement("img");
    img.style.opacity = "0";
    img.style.transition = "opacity 0.4s ease";
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
    img.loading = "lazy";
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
      const angle = (pIndex / totalProjects) * Math.PI * 2 - Math.PI / 2;
      const radius = Math.min(viewW, viewH) * (isMobile ? 0.35 : 0.28);
      const clusterCX = centerX + Math.cos(angle) * radius;
      const clusterCY = centerY + Math.sin(angle) * radius * 0.6;

      const imageCount = isMobile
        ? 1
        : 2 + Math.floor(seededRandom(seed++) * 2);
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

        items.push({
          project,
          slug: project.slug,
          src:
            project.heroImages?.[i % (project.heroImages?.length || 1)]?.src ||
            project.thumbnail,
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

  // ============================================================
  // Render cloud items
  // ============================================================
  function renderCloud() {
    if (!cloudCanvas) return;
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
        el.style.opacity = "0.4";
        el.style.transform = "scale(1)";
      }

      appendCoverMedia(el, item.src, item.project.title);

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

  /** Caps portrait-tall tiles; landscape heights stay unchanged (below this). */
  function timelineItemMaxOuterHeightPx() {
    const vh =
      typeof window !== "undefined" && window.innerHeight > 0
        ? window.innerHeight
        : 900;
    return Math.min(240, Math.max(280, Math.round(vh * 0.4)));
  }

  function capTimelineOuterHeight(outerH) {
    return Math.min(outerH, timelineItemMaxOuterHeightPx());
  }

  function timelineInnerWidth(tileW) {
    return Math.max(1, tileW - 2 * TIMELINE_ITEM_PADDING);
  }

  function syncTimelineCoverMediaSize(el) {
    const tileW = el._timelineTileW;
    if (!tileW || el.classList.contains("timeline__item--video")) return;
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
    timelineTrack.innerHTML = "";

    const sorted = [...projects].sort(compareProjectsChronological);
    const isMobile = window.innerWidth < 768;
    const isXxl = window.innerWidth >= 1400;
    /** Equal width for every tile; image height follows intrinsic aspect (no crop). */
    const tileW = isMobile ? 140 : isXxl ? 220 : 200;

    sorted.forEach((project) => {
      const idx = project.timelineImage ?? 0;
      const heroImages = project.heroImages?.length ? project.heroImages : [];
      const imgSrc = normalizeAssetPath(
        idx === -1
          ? project.thumbnail
          : heroImages[idx]?.src || heroImages[0]?.src || project.thumbnail,
      );

      const el = document.createElement("div");
      el.className = "timeline__item";
      el.dataset.slug = project.slug;
      el._timelineTileW = tileW;

      const imagePool = getProjectImagePool(project);
      el._imagePool = imagePool;
      el._originalSrc = normalizeAssetPath(imgSrc);
      el._autoCycle = !!project.timelineCycle;

      if (project.timelineVideoEmbed) {
        el.classList.add("timeline__item--video");

        const embedWh =
          typeof project.timelineAspect === "number" &&
          project.timelineAspect > 0
            ? project.timelineAspect
            : 16 / 9;
        const innerW = timelineInnerWidth(tileW);
        const innerH = Math.max(1, Math.round(innerW / embedWh));
        const outerH = capTimelineOuterHeight(
          innerH + 2 * TIMELINE_ITEM_PADDING,
        );
        el.dataset.baseW = String(tileW);
        el.dataset.baseH = String(outerH);
        el.style.width = `${tileW}px`;
        el.style.height = `${outerH}px`;

        const posterEl = document.createElement("img");
        posterEl.className = "timeline__video-poster";
        posterEl.src = normalizeAssetPath(
          project.timelineVideoPoster || imgSrc,
        );
        posterEl.alt = `${project.title} preview`;
        posterEl.loading = "lazy";
        el.appendChild(posterEl);

        const videoEl = document.createElement("iframe");
        videoEl.src = project.timelineVideoEmbed;
        videoEl.title = `${project.title} preview`;
        videoEl.allow = "autoplay; fullscreen; picture-in-picture";
        videoEl.referrerPolicy = "strict-origin-when-cross-origin";
        videoEl.setAttribute("allowfullscreen", "");
        videoEl.addEventListener("load", () => {
          el.classList.add("is-video-ready");
        });
        el.appendChild(videoEl);
      } else {
        const innerW = timelineInnerWidth(tileW);
        const provisionalInnerH = Math.round((innerW * 5) / 4);
        const provisionalH = capTimelineOuterHeight(
          provisionalInnerH + 2 * TIMELINE_ITEM_PADDING,
        );
        el.dataset.baseW = String(tileW);
        el.dataset.baseH = String(provisionalH);
        el.style.width = `${tileW}px`;
        el.style.height = `${provisionalH}px`;
        appendCoverMedia(el, imgSrc, project.title);
        bindTimelineCoverMediaResize(el);
      }

      el.addEventListener("mouseenter", () => handleTimelineHover(project, el));
      el.addEventListener("mouseleave", handleTimelineLeave);
      el.addEventListener("click", () => {
        const baseUrl = window.__BASE_URL__ || "/";
        window.location.href = `${baseUrl.replace(/\/$/, "")}/projects/${project.slug}`;
      });

      timelineTrack.appendChild(el);
    });

    // Start always-on cycling for flagged items
    timelineTrack.querySelectorAll(".timeline__item").forEach((el) => {
      if (el._autoCycle) startTimelineCycle(el);
    });
  }

  // ============================================================
  // Timeline: optional always-on image cycle (timelineCycle only)
  // ============================================================
  function getTimelineMediaElements(el) {
    if (el.classList.contains("timeline__item--video")) {
      return [
        el.querySelector(".timeline__video-poster"),
        el.querySelector("iframe"),
      ].filter(Boolean);
    }
    return Array.from(el.querySelectorAll(":scope > img, :scope > video"));
  }

  function startTimelineCycle(el) {
    stopTimelineCycle(el);
    const pool = el._imagePool;
    if (!pool || pool.length < 2) return;
    if (el.classList.contains("timeline__item--video")) return;

    const imgEl = el.querySelector("img");
    if (!imgEl) return;

    let cycleIndex = pool.indexOf(el._originalSrc);
    if (cycleIndex === -1) cycleIndex = 0;

    el._cycleInterval = setInterval(() => {
      cycleIndex = (cycleIndex + 1) % pool.length;
      imgEl.src = pool[cycleIndex];
      imgEl.addEventListener("load", () => syncTimelineCoverMediaSize(el), {
        once: true,
      });
    }, 280);
    el.classList.add("is-cycling");
  }

  function stopTimelineCycle(el) {
    if (el._cycleInterval) {
      clearInterval(el._cycleInterval);
      el._cycleInterval = null;
    }
    el.classList.remove("is-cycling");
    if (el._originalSrc && !el.classList.contains("timeline__item--video")) {
      const imgEl = el.querySelector("img");
      if (imgEl) {
        imgEl.src = el._originalSrc;
        imgEl.addEventListener("load", () => syncTimelineCoverMediaSize(el), {
          once: true,
        });
        if (imgEl.complete && imgEl.naturalWidth) {
          syncTimelineCoverMediaSize(el);
        }
      } else {
        const vid = el.querySelector(":scope > video");
        if (vid) vid.src = el._originalSrc;
      }
    }
  }

  function handleTimelineHover(project, hoveredEl) {
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
    const items = timelineTrack.querySelectorAll(".timeline__item");
    items.forEach((el) => {
      if (!el._autoCycle) {
        stopTimelineCycle(el);
      }
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

    // Activate same-project items, dim others
    document.querySelectorAll(".cloud__item").forEach((cloud) => {
      if (cloud.dataset.slug === slug) {
        gsap.to(cloud, { opacity: 1, duration: 0.3, ease: "power2.out" });
        cloud.classList.add("cloud__item--active");
        cloud.classList.remove("cloud__item--dimmed");
      } else {
        gsap.to(cloud, { opacity: 0.2, duration: 0.3, ease: "power2.out" });
        cloud.classList.add("cloud__item--dimmed");
        cloud.classList.remove("cloud__item--active");
      }
    });

    showOverlay(item.project);
  }

  function handleItemLeave() {
    document.querySelectorAll(".cloud__item").forEach((el) => {
      gsap.to(el, { opacity: 0.4, duration: 0.3, ease: "power2.out" });
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

  function switchView(view) {
    activeView = view;
    switchTrack.dataset.active = view;
    hideOverlay();

    const sloganEl = document.getElementById("slogan");

    if (view === "cloud") {
      cloudView.style.display = "block";
      timelineView.classList.remove("is-active");
      gsap.fromTo(cloudView, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      if (sloganEl) gsap.to(sloganEl, { opacity: 1, duration: 0.3 });
    } else {
      cloudView.style.display = "none";
      timelineView.classList.add("is-active");
      gsap.fromTo(timelineView, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      scrollTimelineToEnd();
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
    const logo = document.getElementById("site-logo");
    const nav = document.getElementById("main-nav");
    const bio = document.getElementById("home-bio");
    const switchEl = document.querySelector(".home__switch");
    const contactEl = document.querySelector(".global-contact");
    const cloudItems = Array.from(document.querySelectorAll(".cloud__item"));

    const sloganEl = document.getElementById("slogan");
    const introSlogan = document.getElementById("intro-slogan");
    const introSloganText = document.getElementById("intro-slogan-text");

    gsap.set([logo, nav, bio, switchEl, contactEl, sloganEl].filter(Boolean), {
      opacity: 0,
    });
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
        introFinished = true;
      },
    });

    if (isFirstVisit && introSlogan && introSloganText) {
      sessionStorage.setItem(INTRO_KEY, "1");

      gsap.set(introSlogan, { opacity: 1 });

      const split = SplitText.create(introSloganText, {
        type: "lines, chars",
        linesClass: "intro-line",
        charsClass: "intro-char",
      });

      gsap.set(split.lines, { opacity: 0, y: 20 });

      // Phase 1 - animate text in staggered by line
      tl.to(split.lines, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
      });

      // Phase 2 - brief hold, then fade out text
      tl.to(
        split.lines,
        {
          opacity: 0,
          y: -20,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.inOut",
        },
        "+=0.8",
      );

      // Phase 3 - fade out the overlay itself
      tl.to(introSlogan, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });

      // Cleanup
      tl.call(() => split.revert());

      const revealLabel = "revealSite";
      tl.addLabel(revealLabel);

      tl.to(
        [logo, nav, bio, switchEl, contactEl, sloganEl].filter(Boolean),
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
          opacity: 0.4,
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
          opacity: 0.4,
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
          opacity: 0.4,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.04,
        },
        "-=0.4",
      );
    } else {
      tl.to([logo, nav, bio, switchEl, contactEl, sloganEl].filter(Boolean), {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
      });
      tl.to(
        group1,
        {
          opacity: 0.4,
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
          opacity: 0.4,
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
          opacity: 0.4,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.04,
        },
        "-=0.4",
      );
    }

    // Wait for fonts to avoid layout bugs
    document.fonts.ready.then(() => {
      // Short delay to let browser paint
      requestAnimationFrame(() => tl.play());
    });
  }

  // ============================================================
  // Init
  // ============================================================
  preloadAllProjectImages();
  renderCloud();
  renderTimeline();
  initDrag();
  playIntro();

  // Recalculate on resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderCloud();
      if (activeView === "timeline") scrollTimelineToEnd();
    }, 250);
  });
});
