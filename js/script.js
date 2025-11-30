

// js/script.js
(function () {
  "use strict";

  // ========= НАСТРОЙКИ TELEGRAM =========
  // ⚠️ ПІДСТАВ СЮДИ СВІЙ НОВИЙ ТОКЕН ТА CHAT_ID
  const TELEGRAM_BOT_TOKEN = "8580437525:AAGJC0I6vKuTx1JhNRVX_d5Zu_8jjv8x6kw";
  const TELEGRAM_CHAT_ID = "-1003280524769"; // ID групи або приватного чату
  const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  // ========= ФІКСОВАНИЙ ХЕДЕР =========
  const header = document.querySelector(".site-header");
  let headerHeight = header ? header.offsetHeight : 0;

  window.addEventListener("resize", () => {
    headerHeight = header ? header.offsetHeight : 0;
  });

  // ========= МОБІЛЬНЕ МЕНЮ =========
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a[data-scroll]").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ========= ПЛАВНИЙ СКРОЛ З УРАХУВАННЯМ FIXED-ХЕДЕРА =========
  const scrollLinks = document.querySelectorAll('a[data-scroll], a[href^="#"]');

  scrollLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#" || href === "#0") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      const rect = target.getBoundingClientRect();
      const offset = rect.top + window.pageYOffset - headerHeight - 8;

      window.scrollTo({
        top: offset,
        behavior: "smooth",
      });
    });
  });

  // ========= АКТИВНИЙ ПУНКТ МЕНЮ ПРИ СКРОЛІ =========
  const menuLinks = document.querySelectorAll(".nav-links a[href^='#']");

  // id секції -> лінк меню
  const linkById = new Map();
  menuLinks.forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href === "#" || href === "#0") return;

    const id = href.slice(1);
    const section = document.getElementById(id);
    if (section) linkById.set(id, a);
  });

  let sections = Array.from(linkById.keys())
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setActiveLink(activeId) {
    menuLinks.forEach((a) => {
      a.classList.remove("is-active");
      a.removeAttribute("aria-current");
    });

    if (!activeId) return;

    const activeLink = linkById.get(activeId);
    if (activeLink) {
      activeLink.classList.add("is-active");
      activeLink.setAttribute("aria-current", "page");
    }
  }

  function updateActiveOnScroll() {
    const hh = header ? header.offsetHeight : headerHeight;
    const y = window.scrollY + hh + 24; // 24px — “запас” під хедером

    // Якщо доскролили до самого низу — активуємо останню секцію
    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (nearBottom && sections.length) {
      setActiveLink(sections[sections.length - 1].id);
      return;
    }

    let currentId = null;
    for (const section of sections) {
      if (section.offsetTop <= y) currentId = section.id;
      else break;
    }

    // якщо ще вище першої секції з меню — нічого не підсвічуємо
    if (sections[0] && y < sections[0].offsetTop) currentId = null;

    setActiveLink(currentId);
  }

  let raf = 0;
  function onScrollOrResize() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;

      // на resize/переломах може змінитися висота/позиції
      sections = Array.from(linkById.keys())
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      updateActiveOnScroll();
    });
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);

  // первинне підсвічування
  updateActiveOnScroll();



  // ========= ВІДПРАВКА ФОРМИ У TELEGRAM =========
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("form-status");

  function showStatus(message, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.style.color = isError ? "#fecaca" : "#a7f3d0";
    statusEl.classList.add("visible");

    setTimeout(() => {
      statusEl.classList.remove("visible");
    }, 4000);
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const name = formData.get("name") || "—";
      const email = formData.get("email") || "—";
      const message = formData.get("message") || "—";

      // Формуємо текст для Telegram
      const text =
        "📩 <b>Нова заявка з портфоліо</b>\n\n" +
        `👤 <b>Ім'я:</b> ${name}\n` +
        `📧 <b>Email:</b> ${email}\n` +
        `💬 <b>Повідомлення:</b>\n${message}`;

      // Створюємо URL з GET-параметрами
      const url = new URL(TELEGRAM_API_URL);
      url.searchParams.set("chat_id", TELEGRAM_CHAT_ID);
      url.searchParams.set("text", text);
      url.searchParams.set("parse_mode", "HTML");

      try {
        // Через CORS ми не зможемо прочитати відповідь, але запит піде
        await fetch(url.toString(), {
          method: "GET",
          mode: "no-cors", // важливо: інакше браузер заблокує через CORS
        });

        form.reset();
        showStatus(
          "Thank you! Your message was sent. Please check the Telegram group.",
          false
        );
      } catch (err) {
        console.error("Telegram send error:", err);
        showStatus(
          "Oops, something went wrong. Please try again later or contact me directly by email.",
          true
        );
      }
    });
  }

  // ========= ПОТОЧНИЙ РІК У ФУТЕРІ =========
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }
})();
