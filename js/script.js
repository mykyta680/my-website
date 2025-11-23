// js/script.js
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  let headerHeight = header ? header.offsetHeight : 0;

  window.addEventListener("resize", () => {
    headerHeight = header ? header.offsetHeight : 0;
  });

  // Мобільне меню (бургер)
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

  // Плавний скрол з урахуванням fixed-хедера
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

  // Фейкове надсилання форми
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("form-status");

  if (form && statusEl) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.reset();
      statusEl.classList.add("visible");

      setTimeout(() => {
        statusEl.classList.remove("visible");
      }, 3500);
    });
  }

  // Поточний рік у футері
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }
})();




// js/script.js
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  let headerHeight = header ? header.offsetHeight : 0;

  window.addEventListener("resize", () => {
    headerHeight = header ? header.offsetHeight : 0;
  });

  // Мобільне меню (бургер)
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

  // Плавний скрол з урахуванням fixed-хедера
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

  // Відправка форми на бекенд, який уже шле в Telegram
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("form-status");

  if (form && statusEl) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        message: formData.get("message"),
      };

      try {
        const response = await fetch("/api/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Error sending message");
        }

        form.reset();
        statusEl.textContent =
          "Thank you! Your message was sent to Telegram. I’ll get back to you soon.";
        statusEl.classList.add("visible");
      } catch (err) {
        console.error(err);
        statusEl.textContent =
          "Oops, something went wrong. Please try again later or write to me directly by email.";
        statusEl.classList.add("visible");
      }

      setTimeout(() => {
        statusEl.classList.remove("visible");
      }, 4000);
    });
  }

  // Поточний рік у футері
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }
})();
