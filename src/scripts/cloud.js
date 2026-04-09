/**
 * Cloud & Timeline view — GSAP-powered interactive project canvas
 * Inspired by aletagency.com scattered layout
 */

import gsap from "gsap";
import { compareProjectsChronological } from "../lib/projectYear.ts";
import { isVideoAssetPath } from "../lib/media.ts";

document.addEventListener("DOMContentLoaded", () => {
  const projects = window.__PROJECTS__ || [];
  if (!projects.length) return;

  const cloudCanvas = document.getElementById("cloud-canvas");
  const timelineTrack = document.getElementById("timeline-track");
  const cloudView = document.getElementById("cloud-view");
  const timelineView = document.getElementById("timeline-view");
  const overlay = document.getElementById("project-overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayUrl = document.getElementById("overlay-url");
  const overlayCategory = document.getElementById("overlay-category");
  const overlayLink = document.getElementById("overlay-link");
  const switchTrack = document.getElementById("switch-track");
  const switchLabels = document.querySelectorAll(".switch__label");

  let activeView = "cloud";
  let isDragging = false;
  let dragStartX = 0;
  let canvasStartX = 0;
  let currentCanvasX = 0;

  // ============================================================
  // Image cycle effect — preloading & state
  // ============================================================
  const preloadedImages = new Map();

  function getProjectImagePool(project) {
    const pool = [];
    if (project.heroImages?.length) {
      project.heroImages.forEach((img) => pool.push(img.src));
    }
    if (project.thumbnail && !pool.includes(project.thumbnail)) {
      pool.push(project.thumbnail);
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
    if (isVideoAssetPath(src)) {
      const v = document.createElement("video");
      v.src = src;
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
    img.src = src;
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
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const centerX = viewW * 0.5;
    const centerY = viewH * 0.5;
    const gap = 12;
    const isMobile = viewW < 768;
    const isTablet = viewW >= 768 && viewW < 1024;
    const sizeScale = isMobile ? 0.55 : isTablet ? 0.75 : 1;

    const totalProjects = projects.length;
    const items = [];
    let seed = 42;

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
          for (const placed of items) {
            if (rectsOverlap(candidate, placed, gap)) {
              collides = true;
              break;
            }
          }
          if (!collides) break;
          const nudgeAngle = seededRandom(seed++) * Math.PI * 2;
          const nudgeDist = 20 + seededRandom(seed++) * 30;
          candidate.x += Math.cos(nudgeAngle) * nudgeDist;
          candidate.y += Math.sin(nudgeAngle) * nudgeDist;
          attempts++;
        }

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

    return items;
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
  function renderTimeline() {
    if (!timelineTrack) return;
    timelineTrack.innerHTML = "";

    const sorted = [...projects].sort(compareProjectsChronological);
    const isMobile = window.innerWidth < 768;
    const baseHeights = [224, 288, 304, 272, 240];
    const heights = isMobile
      ? baseHeights.map((h) => Math.round(h * 0.65))
      : baseHeights;
    const aspectRatios = [0.8, 1.1, 1.45, 0.95, 1.6];

    sorted.forEach((project) => {
      const idx = project.timelineImage ?? 0;
      const heroImages = project.heroImages?.length ? project.heroImages : [];
      const imgSrc =
        idx === -1
          ? project.thumbnail
          : heroImages[idx]?.src || heroImages[0]?.src || project.thumbnail;

      const el = document.createElement("div");
      el.className = "timeline__item";
      el.dataset.slug = project.slug;

      const h = heights[project.order % heights.length];
      const ratio =
        project.timelineAspect ??
        aspectRatios[project.order % aspectRatios.length];
      const w = Math.round(h * ratio);
      el.dataset.baseW = w;
      el.dataset.baseH = h;
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;

      const imagePool = getProjectImagePool(project);
      el._imagePool = imagePool;
      el._originalSrc = imgSrc;
      el._autoCycle = !!project.timelineCycle;

      if (project.timelineVideoEmbed) {
        el.classList.add("timeline__item--video");

        const posterEl = document.createElement("img");
        posterEl.className = "timeline__video-poster";
        posterEl.src = project.timelineVideoPoster || imgSrc;
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
        appendCoverMedia(el, imgSrc, project.title);
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
  // Timeline depth-zoom hover + image strobe cycle
  // ============================================================
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

    startTimelineCycle(hoveredEl);
    showOverlay(project, hoveredEl);
  }

  function handleTimelineLeave() {
    const items = timelineTrack.querySelectorAll(".timeline__item");
    items.forEach((el) => {
      if (!el._autoCycle) {
        stopTimelineCycle(el);
      }
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

    showOverlay(item.project, el);
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
  function showOverlay(project, nearEl) {
    if (
      !overlay ||
      !overlayTitle ||
      !overlayUrl ||
      !overlayCategory ||
      !overlayLink
    )
      return;

    overlayTitle.textContent = project.title;
    overlayUrl.textContent = project.url || "";
    overlayCategory.textContent = project.category;
    const baseUrl = window.__BASE_URL__ || "/";
    overlayLink.href = `${baseUrl.replace(/\/$/, "")}/projects/${project.slug}`;

    // Position near hovered element
    const rect = nearEl.getBoundingClientRect();
    let top;
    let left;

    const overlayW = 270;

    if (activeView === "timeline") {
      // Timeline: overlay above thumb; right-align card to image right edge.
      top = rect.top - 238;
      left = rect.right - overlayW;
    } else {
      // Cloud: place overlay beside hovered image.
      top = rect.top;
      left = rect.right + 16;

      if (left + 280 > window.innerWidth) {
        left = rect.left - 286;
      }
    }

    // Keep on screen for both modes
    if (top + 238 > window.innerHeight) {
      top = window.innerHeight - 254;
    }
    if (top < 16) top = 16;
    if (left < 16) left = 16;
    if (left + overlayW > window.innerWidth - 16) {
      left = window.innerWidth - overlayW - 16;
    }

    overlay.style.position = "fixed";
    overlay.style.top = `${top}px`;
    overlay.style.left = `${left}px`;

    gsap.killTweensOf(overlay);
    gsap.fromTo(
      overlay,
      { opacity: 0, y: -36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
        onStart: () => {
          overlay.style.pointerEvents = "auto";
        },
      },
    );
  }

  function hideOverlay() {
    if (!overlay) return;
    gsap.killTweensOf(overlay);
    gsap.to(overlay, {
      opacity: 0,
      y: -20,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        overlay.style.pointerEvents = "none";
      },
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

    if (view === "cloud") {
      cloudView.style.display = "block";
      timelineView.classList.remove("is-active");
      gsap.fromTo(cloudView, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    } else {
      cloudView.style.display = "none";
      timelineView.classList.add("is-active");
      gsap.fromTo(timelineView, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      scrollTimelineToEnd();
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
  // Intro Animation
  // ============================================================
  const INTRO_KEY = "joy__intro_played";
  const isFirstVisit = !sessionStorage.getItem(INTRO_KEY);

  function playIntro() {
    const overlay = document.getElementById("intro-overlay");
    const heroText = document.getElementById("intro-hero");

    const logo = document.getElementById("site-logo");
    const nav = document.getElementById("main-nav");
    const bio = document.getElementById("home-bio");
    const switchEl = document.querySelector(".home__switch");
    const cloudItems = Array.from(document.querySelectorAll(".cloud__item"));

    // Hide page elements until their reveal step
    gsap.set([logo, nav, bio, switchEl].filter(Boolean), { opacity: 0 });
    gsap.set(cloudItems, {
      opacity: 0,
      scale: 0.8,
      transformOrigin: "center center",
    });

    // Divide cloud items into 3 random groups
    const shuffled = [...cloudItems].sort(() => Math.random() - 0.5);
    const third = Math.ceil(shuffled.length / 3);
    const group1 = shuffled.slice(0, third);
    const group2 = shuffled.slice(third, third * 2);
    const group3 = shuffled.slice(third * 2);

    const tl = gsap.timeline();

    if (isFirstVisit && overlay && heroText) {
      // Full intro: hero text on black → color flip → reveal page
      sessionStorage.setItem(INTRO_KEY, "1");

      tl.to(heroText, {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.8,
        ease: "power3.out",
      });

      tl.to({}, { duration: 0.8 });

      tl.to(overlay, {
        backgroundColor: "#f5f1e6",
        duration: 0.12,
        ease: "none",
      });
      tl.to(heroText, { color: "#1c1c1c", duration: 0.12, ease: "none" }, "<");

      tl.to({}, { duration: 0.4 });

      const handoff = "handoff";
      tl.to(
        heroText,
        { opacity: 0, duration: 0.8, ease: "power3.out" },
        handoff,
      );
      tl.to(
        overlay,
        {
          opacity: 0,
          duration: 0.45,
          ease: "power3.out",
          onComplete: () => overlay.remove(),
        },
        handoff,
      );
      tl.to(
        [logo, nav, bio, switchEl].filter(Boolean),
        { opacity: 1, duration: 0.5, ease: "power3.out" },
        handoff,
      );

      tl.to(
        group1,
        {
          opacity: 0.4,
          scale: 1,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.04,
        },
        `${handoff}+=0.12`,
      );
      tl.to(
        group2,
        {
          opacity: 0.4,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.04,
        },
        "-=0.35",
      );
      tl.to(
        group3,
        {
          opacity: 0.4,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.04,
        },
        "-=0.3",
      );
    } else {
      // Return visit: skip hero, just reveal logo/nav/bio + cloud
      if (overlay) overlay.remove();

      tl.to([logo, nav, bio, switchEl].filter(Boolean), {
        opacity: 1,
        duration: 0.45,
        ease: "power2.out",
      });
      tl.to(
        group1,
        {
          opacity: 0.4,
          scale: 1,
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.04,
        },
        "-=0.25",
      );
      tl.to(
        group2,
        {
          opacity: 0.4,
          scale: 1,
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.04,
        },
        "-=0.3",
      );
      tl.to(
        group3,
        {
          opacity: 0.4,
          scale: 1,
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.04,
        },
        "-=0.25",
      );
    }
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
