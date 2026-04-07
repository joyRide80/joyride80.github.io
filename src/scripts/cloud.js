/**
 * Cloud & Timeline view — GSAP-powered interactive project canvas
 * Inspired by aletagency.com scattered layout
 */

import gsap from "gsap";

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
  // Seed-based pseudo-random for consistent layouts
  // ============================================================
  function seededRandom(seed) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  // ============================================================
  // Generate cloud positions — cluster by project
  // ============================================================
  function generateCloudPositions() {
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const centerX = viewW * 0.5;
    const centerY = viewH * 0.5;

    // Spread projects across the canvas
    const totalProjects = projects.length;
    const items = [];
    let seed = 42;

    projects.forEach((project, pIndex) => {
      // Each project gets a cluster center
      const angle = (pIndex / totalProjects) * Math.PI * 2 - Math.PI / 2;
      const radius = Math.min(viewW, viewH) * 0.28;
      const clusterCX = centerX + Math.cos(angle) * radius;
      const clusterCY = centerY + Math.sin(angle) * radius * 0.6;

      // Generate 2-3 images per project cluster
      const imageCount = 2 + Math.floor(seededRandom(seed++) * 2);
      const sizes = [
        { w: 140, h: 140 },
        { w: 180, h: 180 },
        { w: 160, h: 130 },
        { w: 200, h: 170 },
      ];

      for (let i = 0; i < imageCount; i++) {
        const size = sizes[Math.floor(seededRandom(seed++) * sizes.length)];
        const offsetX = (seededRandom(seed++) - 0.5) * 120;
        const offsetY = (seededRandom(seed++) - 0.5) * 80;
        const rotation = (seededRandom(seed++) - 0.5) * 12;

        items.push({
          project,
          slug: project.slug,
          src:
            project.heroImages?.[i % (project.heroImages?.length || 1)]?.src ||
            project.thumbnail,
          x: clusterCX + offsetX - size.w / 2,
          y: clusterCY + offsetY - size.h / 2,
          w: size.w,
          h: size.h,
          rotation,
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
      el.style.transform = `rotate(${item.rotation}deg)`;
      el.style.zIndex = String(i);

      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.project.title;
      img.loading = "lazy";
      el.appendChild(img);

      // Hover events
      el.addEventListener("mouseenter", () => handleItemHover(item, el));
      el.addEventListener("mouseleave", handleItemLeave);
      el.addEventListener("click", () => {
        if (!isDragging) {
          window.location.href = `/projects/${item.slug}`;
        }
      });

      cloudCanvas.appendChild(el);
    });
  }

  // ============================================================
  // Render timeline items
  // ============================================================
  function renderTimeline() {
    if (!timelineTrack) return;
    timelineTrack.innerHTML = "";

    // Sort by year (oldest → newest for left-to-right)
    const sorted = [...projects].sort((a, b) => a.order - b.order).reverse();

    sorted.forEach((project) => {
      const images = project.heroImages?.length
        ? project.heroImages
        : [{ src: project.thumbnail }];

      images.forEach((img, i) => {
        const el = document.createElement("div");
        el.className = "timeline__item";
        el.dataset.slug = project.slug;

        // Vary heights
        const heights = [140, 180, 250, 170, 200];
        const h = heights[(i + project.order) % heights.length];
        const w = h * (0.7 + Math.random() * 0.5);
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;

        const imgEl = document.createElement("img");
        imgEl.src = img.src || project.thumbnail;
        imgEl.alt = project.title;
        imgEl.loading = "lazy";
        el.appendChild(imgEl);

        el.addEventListener("mouseenter", () =>
          handleTimelineHover(project, el),
        );
        el.addEventListener("mouseleave", handleItemLeave);
        el.addEventListener("click", () => {
          window.location.href = `/projects/${project.slug}`;
        });

        timelineTrack.appendChild(el);
      });
    });
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

  function handleTimelineHover(project, el) {
    const slug = project.slug;

    document.querySelectorAll(".timeline__item").forEach((tl) => {
      if (tl.dataset.slug === slug) {
        gsap.to(tl, { opacity: 1, duration: 0.3, ease: "power2.out" });
      } else {
        gsap.to(tl, { opacity: 0.2, duration: 0.3, ease: "power2.out" });
      }
    });

    showOverlay(project, el);
  }

  function handleItemLeave() {
    // Reset all opacities
    const selector =
      activeView === "cloud" ? ".cloud__item" : ".timeline__item";
    document.querySelectorAll(selector).forEach((el) => {
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
    overlayLink.href = `/projects/${project.slug}`;

    // Position near hovered element
    const rect = nearEl.getBoundingClientRect();
    let top = rect.top;
    let left = rect.right + 16;

    // Keep on screen
    if (left + 280 > window.innerWidth) {
      left = rect.left - 286;
    }
    if (top + 200 > window.innerHeight) {
      top = window.innerHeight - 220;
    }

    overlay.style.position = "fixed";
    overlay.style.top = `${top}px`;
    overlay.style.left = `${left}px`;

    gsap.to(overlay, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.out",
      onStart: () => {
        overlay.style.pointerEvents = "auto";
      },
    });

    // Text glitch effect on title
    glitchText(overlayTitle, project.title);
  }

  function hideOverlay() {
    if (!overlay) return;
    gsap.to(overlay, {
      opacity: 0,
      y: 10,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        overlay.style.pointerEvents = "none";
      },
    });
  }

  // ============================================================
  // Text glitch: Tiny5 → Pantasia transition
  // ============================================================
  function glitchText(el, text) {
    const frames = [
      { fontFamily: "'Tiny5', monospace", duration: 0.06 },
      {
        fontFamily: "'Pantasia', 'Hedvig Letters Serif', serif",
        duration: 0.06,
      },
      { fontFamily: "'Tiny5', monospace", duration: 0.04 },
      {
        fontFamily: "'Pantasia', 'Hedvig Letters Serif', serif",
        duration: 0.08,
      },
    ];

    const tl = gsap.timeline();
    frames.forEach((frame) => {
      tl.to(el, {
        fontFamily: frame.fontFamily,
        duration: frame.duration,
        ease: "none",
      });
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
        // Reset isDragging after a tick so click doesn't fire
        setTimeout(() => {
          isDragging = false;
        }, 50);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    });
  }

  // ============================================================
  // View switching
  // ============================================================
  function switchView(view) {
    activeView = view;
    switchTrack.dataset.active = view;

    if (view === "cloud") {
      cloudView.style.display = "block";
      timelineView.classList.remove("is-active");
      gsap.fromTo(cloudView, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    } else {
      cloudView.style.display = "none";
      timelineView.classList.add("is-active");
      gsap.fromTo(timelineView, { opacity: 0 }, { opacity: 1, duration: 0.4 });
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
  // Init
  // ============================================================
  renderCloud();
  renderTimeline();
  initDrag();

  // Recalculate on resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderCloud();
    }, 250);
  });
});
