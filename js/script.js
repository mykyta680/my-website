// js/script.js
(function () {
  "use strict";

  const body = document.body;
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const menuLinks = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
  const scrollLinks = document.querySelectorAll("a[data-scroll], a[href^='#']");
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("form-status");
  const yearSpan = document.getElementById("year");

  let headerHeight = header ? header.offsetHeight : 0;
  let raf = 0;

  function updateHeaderHeight() {
    headerHeight = header ? header.offsetHeight : 0;
  }

  function closeMenu() {
    if (!navToggle || !navLinks) return;
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(".site-nav")) closeMenu();
    });
  }

  scrollLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#" || href === "#0" || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      closeMenu();

      const rect = target.getBoundingClientRect();
      const offset = rect.top + window.pageYOffset - headerHeight - 10;

      window.scrollTo({
        top: offset,
        behavior: "smooth",
      });
    });
  });

  const linkById = new Map();
  menuLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const id = href.slice(1);
    if (document.getElementById(id)) {
      linkById.set(id, link);
    }
  });

  function setActiveLink(activeId) {
    menuLinks.forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });

    const activeLink = activeId ? linkById.get(activeId) : null;
    if (activeLink) {
      activeLink.classList.add("is-active");
      activeLink.setAttribute("aria-current", "page");
    }
  }

  function updateActiveLink() {
    const sections = Array.from(linkById.keys())
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const scrollPosition = window.scrollY + headerHeight + 40;
    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    if (nearBottom && sections.length) {
      setActiveLink(sections[sections.length - 1].id);
      return;
    }

    let currentId = null;
    sections.forEach((section) => {
      if (section.offsetTop <= scrollPosition) currentId = section.id;
    });

    setActiveLink(currentId);
  }

  function onScrollOrResize() {
    if (raf) return;

    raf = window.requestAnimationFrame(() => {
      raf = 0;
      updateHeaderHeight();
      updateActiveLink();
    });
  }

  if (revealItems.length) {
    body.classList.add("reveal-ready");
    revealItems.forEach((item) => item.classList.add("reveal"));

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
      );

      revealItems.forEach((item) => observer.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    }
  }

  function showStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle("is-error", type === "error");
    statusEl.classList.toggle("is-success", type === "success");
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const project = String(formData.get("project") || "").trim();
      const message = String(formData.get("message") || "").trim();
      const website = String(formData.get("website") || "").trim();
      const endpoint = form.dataset.endpoint;
      const submitButton = form.querySelector('button[type="submit"]');

      if (!name || !email || !message) {
        showStatus("Будь ласка, заповніть ім’я, email і повідомлення.", "error");
        return;
      }

      if (!endpoint) {
        showStatus("Надсилання ще не налаштоване. Спробуйте написати на email.", "error");
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
      }
      showStatus("Надсилаю повідомлення…", "success");

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, project, message, website }),
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.ok) {
          throw new Error("Telegram form request failed");
        }

        showStatus("Дякую! Повідомлення успішно надіслано в Telegram.", "success");
        form.reset();
      } catch (error) {
        showStatus(
          "Не вдалося надіслати повідомлення. Будь ласка, спробуйте ще раз або напишіть на email.",
          "error"
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute("aria-busy");
        }
      }
    });
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);
  updateHeaderHeight();
  updateActiveLink();

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }
})();
