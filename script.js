/* ============================================================
   BUJÓNS ELECTROTÈCNICS — script.js v3.0
   i18n (internacionalización) + menú móvil + formulario
   ============================================================ */

(function(){
'use strict';

// ── 1. SISTEMA i18n ─────────────────────────────────────────
const i18n = {
  currentLang: localStorage.getItem('lang') || 'ca',
  translations: {},
  
  async init(){
    await this.loadLanguage(this.currentLang);
    this.applyTranslations();
    this.updateActiveFlags();
    this.setupLanguageSwitchers();
  },
  
  async loadLanguage(lang){
    try{
      const res = await fetch(`i18n/${lang}.json`);
      if(!res.ok) throw new Error('Translation file not found');
      this.translations = await res.json();
      this.currentLang = lang;
      localStorage.setItem('lang', lang);
      document.documentElement.lang = lang === 'ca' ? 'ca' : lang === 'es' ? 'es' : lang === 'fr' ? 'fr' : 'en';
    }catch(e){
      console.error('Error loading translations:', e);
      if(lang !== 'ca'){
        // Fallback to Catalan
        await this.loadLanguage('ca');
      }
    }
  },
  
  applyTranslations(){
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.get(key);
      if(translation){
        if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'){
          el.placeholder = translation;
        }else{
          el.textContent = translation;
        }
      }
    });
    
    // Update page title if exists
    const titleKey = document.body.getAttribute('data-page-title');
    if(titleKey){
      const title = this.get(titleKey);
      if(title) document.title = title;
    }
  },
  
  get(key){
    const keys = key.split('.');
    let value = this.translations;
    for(const k of keys){
      value = value?.[k];
      if(value === undefined) return null;
    }
    return value;
  },
  
  updateActiveFlags(){
    document.querySelectorAll('.flags img, .flags-mobile img').forEach((img, i) => {
      const langs = ['ca', 'es', 'fr', 'en'];
      const lang = langs[i % 4];
      img.classList.toggle('active', lang === this.currentLang);
    });
  },
  
  setupLanguageSwitchers(){
    document.querySelectorAll('.flags img, .flags-mobile img').forEach((img, i) => {
      const langs = ['ca', 'es', 'fr', 'en'];
      const lang = langs[i % 4];
      img.style.cursor = 'pointer';
      img.addEventListener('click', async (e) => {
        e.preventDefault();
        if(lang !== this.currentLang){
          await this.loadLanguage(lang);
          this.applyTranslations();
          this.updateActiveFlags();
        }
      });
    });
  }
};

// ── 2. ANIMACIONES SCROLL (original) ────────────────────────
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.style.opacity = 1;
      e.target.style.transform = 'translateY(0)';
      io.unobserve(e.target);
    }
  });
}, {threshold: .18});

document.querySelectorAll('.card,.panel').forEach(el => {
  el.style.opacity = .01;
  el.style.transform = 'translateY(10px)';
  el.style.transition = 'all .45s ease';
  io.observe(el);
});

// ── 3. MENÚ MÓVIL ───────────────────────────────────────────
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.mobile-menu');

if(toggle && menu){
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
  
  // Close on outside click
  document.addEventListener('click', e => {
    if(!toggle.contains(e.target) && !menu.contains(e.target)){
      menu.classList.remove('open');
      toggle.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ── 4. FORMULARIO DE CONTACTO (arreglado) ───────────────────
const form = document.getElementById('contact-form');
if(form){
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    
    if(!name || !email || !message){
      alert(i18n.get('form.error_fill') || 'Si us plau, omple tots els camps.');
      return;
    }
    
    // Get Turnstile token
    let token = null;
    const turnstileResponse = form.querySelector('[name="cf-turnstile-response"]');
    if(turnstileResponse){
      token = turnstileResponse.value;
    }
    
    if(!token){
      alert(i18n.get('form.error_captcha') || 'Completa la verificació de seguretat.');
      return;
    }
    
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = i18n.get('form.sending') || 'Enviant...';
    
    try {
      const res = await fetch('https://formspree.io/f/mzdylwoe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          message: message,
          'g-recaptcha-response': token,  // Formspree también acepta este nombre
          '_subject': `Nou missatge de ${name}`,
          '_replyto': email
        })
      });
      
      const data = await res.json();
      
      if(res.ok){
        alert(i18n.get('form.success') || '✅ Missatge enviat correctament!');
        form.reset();
        if(window.turnstile) window.turnstile.reset();
      }else{
        console.error('Formspree error:', data);
        alert(i18n.get('form.error') || '❌ Hi ha hagut un error. Torna-ho a provar.');
      }
    }catch(err){
      console.error('Form submission error:', err);
      alert(i18n.get('form.error') || '❌ Hi ha hagut un error. Torna-ho a provar.');
    }finally{
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

// ── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
});

})();
