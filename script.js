/* ============================================================
   BUJÓNS ELECTROTÈCNICS — script.js v2.0
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. LANGUAGE SWITCHER ─────────────────────────────────
     Detects current page and updates flag links to the
     equivalent page in each language.
  ──────────────────────────────────────────────────────────── */
  const PAGES = [
    'index',
    'empresa',
    'productes-serveis',
    'on-som',
    'contacte',
    'avis-legal',
  ];

  const LANG_SUFFIX = {
    cat: '',          // Català – base file
    es:  '-es',
    fr:  '-fr',
    en:  '-en',
  };

  function getCurrentBase() {
    const file = location.pathname.split('/').pop().replace('.html', '') || 'index';
    // Strip language suffix to get base page name
    for (const suffix of ['-es', '-fr', '-en']) {
      if (file.endsWith(suffix)) {
        return file.slice(0, -suffix.length);
      }
    }
    return file;
  }

  function getCurrentLang() {
    const file = location.pathname.split('/').pop() || 'index.html';
    if (file.includes('-es.')) return 'es';
    if (file.includes('-fr.')) return 'fr';
    if (file.includes('-en.')) return 'en';
    return 'cat';
  }

  function buildUrl(lang) {
    const base = getCurrentBase();
    const suffix = LANG_SUFFIX[lang];
    return base + suffix + '.html';
  }

  function initLanguageSwitcher() {
    const langMap = {
      cat: document.querySelector('a[data-lang="cat"], .flags a:nth-child(1)'),
      es:  document.querySelector('a[data-lang="es"],  .flags a:nth-child(2)'),
      fr:  document.querySelector('a[data-lang="fr"],  .flags a:nth-child(3)'),
      en:  document.querySelector('a[data-lang="en"],  .flags a:nth-child(4)'),
    };

    // Also update mobile flags if present
    const mobileLangMap = {
      cat: document.querySelector('.flags-mobile a:nth-child(1)'),
      es:  document.querySelector('.flags-mobile a:nth-child(2)'),
      fr:  document.querySelector('.flags-mobile a:nth-child(3)'),
      en:  document.querySelector('.flags-mobile a:nth-child(4)'),
    };

    const currentLang = getCurrentLang();

    Object.entries(langMap).forEach(([lang, el]) => {
      if (!el) return;
      el.href = buildUrl(lang);
      if (lang === currentLang) el.classList.add('active');
    });

    Object.entries(mobileLangMap).forEach(([lang, el]) => {
      if (!el) return;
      el.href = buildUrl(lang);
      if (lang === currentLang) el.classList.add('active');
    });
  }

  /* ── 2. MOBILE MENU ───────────────────────────────────────── */
  function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const menu   = document.querySelector('.mobile-menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── 3. HEADER SCROLL EFFECT ─────────────────────────────── */
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 4. ACTIVE NAV LINK ───────────────────────────────────── */
  function initActiveNav() {
    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a, .mobile-menu a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href && current.includes(href.replace('.html', ''))) {
        link.classList.add('active');
      }
    });
  }

  /* ── 5. SCROLL-IN ANIMATIONS ─────────────────────────────── */
  function initScrollAnimations() {
    const els = document.querySelectorAll('.fade-in');
    if (!els.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              observer.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      els.forEach(el => observer.observe(el));
    } else {
      // Fallback: show all
      els.forEach(el => el.classList.add('visible'));
    }
  }

  /* ── 6. PREVENT TRANSITION FLASH ON RESIZE ───────────────── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    document.body.classList.add('resize-transition-stopper');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.body.classList.remove('resize-transition-stopper');
    }, 100);
  });

  /* ── 7. CONTACT FORM (Formspree + Turnstile) ─────────────── */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const name    = form.name?.value.trim();
      const email   = form.email?.value.trim();
      const message = form.message?.value.trim();

      if (!name || !email || !message) {
        showFormAlert(form, 'error', getT('fill_all'));
        return;
      }

      // Cloudflare Turnstile token
      let cfToken = null;
      const tokenInput = form.querySelector('[name="cf-turnstile-response"]');
      if (tokenInput) cfToken = tokenInput.value;
      if (!cfToken) {
        showFormAlert(form, 'error', getT('captcha'));
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '…';

      const endpoint = form.dataset.endpoint;

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name, email, message, 'cf-turnstile-response': cfToken }),
        });

        if (res.ok) {
          form.reset();
          if (window.turnstile) window.turnstile.reset();
          const successBox = document.querySelector('.form-success');
          if (successBox) {
            form.style.display = 'none';
            successBox.classList.add('show');
          } else {
            showFormAlert(form, 'success', getT('sent'));
          }
        } else {
          throw new Error('Server error');
        }
      } catch {
        showFormAlert(form, 'error', getT('error'));
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  }

  function showFormAlert(form, type, msg) {
    let el = form.querySelector('.form-alert');
    if (!el) {
      el = document.createElement('p');
      el.className = 'form-alert';
      form.insertBefore(el, form.querySelector('button'));
    }
    el.textContent = msg;
    el.style.cssText = `color:${type === 'error' ? '#f87171' : '#4ade80'};font-size:.85rem;margin:.25rem 0;`;
    setTimeout(() => el.remove(), 6000);
  }

  // Simple i18n for form messages based on current language
  const FORM_MSGS = {
    cat: { fill_all: 'Si us plau, omple tots els camps.',         captcha: 'Completa la verificació de seguretat.',     sent: 'Missatge enviat correctament!',        error: "Hi ha hagut un error. Torna-ho a provar." },
    es:  { fill_all: 'Por favor, completa todos los campos.',     captcha: 'Completa la verificación de seguridad.',    sent: '¡Mensaje enviado correctamente!',       error: 'Ha ocurrido un error. Inténtalo de nuevo.' },
    fr:  { fill_all: 'Veuillez remplir tous les champs.',         captcha: 'Complétez la vérification de sécurité.',   sent: 'Message envoyé avec succès !',          error: 'Une erreur est survenue. Réessayez.' },
    en:  { fill_all: 'Please fill in all fields.',                captcha: 'Complete the security verification.',      sent: 'Message sent successfully!',            error: 'An error occurred. Please try again.' },
  };

  function getT(key) {
    const lang = getCurrentLang();
    return FORM_MSGS[lang]?.[key] || FORM_MSGS.cat[key];
  }

  /* ── INIT ───────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    initMobileMenu();
    initHeaderScroll();
    initActiveNav();
    initScrollAnimations();
    initContactForm();
  });

})();
