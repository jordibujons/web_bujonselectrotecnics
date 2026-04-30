/* ============================================================
   BUJÓNS ELECTROTÈCNICS — script.js DEFINITIVO v2.1
   5 idiomas + validación + banner + WhatsApp (nuevo nº)
   ============================================================ */

(function(){
'use strict';

// ── 1. SISTEMA i18n (5 IDIOMAS) ────────────────────────────
const i18n = {
  currentLang: localStorage.getItem('lang') || 'ca',
  translations: {},
  
  async init(){
    await this.loadLanguage(this.currentLang);
    this.applyTranslations();
    this.updateActiveFlags();
    this.setupLanguageSwitchers();
    this.setupWhatsAppLink();
  },
  
  async loadLanguage(lang){
    try{
      const res = await fetch(`i18n/${lang}.json`);
      if(!res.ok) throw new Error('Translation file not found');
      this.translations = await res.json();
      this.currentLang = lang;
      localStorage.setItem('lang', lang);
      document.documentElement.lang = lang;
    }catch(e){
      console.error('Error loading translations:', e);
      if(lang !== 'ca') await this.loadLanguage('ca');
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
    const langs = ['ca', 'es', 'fr', 'en', 'it'];
    document.querySelectorAll('.flags img, .flags-mobile img').forEach((img, i) => {
      const lang = langs[i % 5];
      img.classList.toggle('active', lang === this.currentLang);
    });
  },
  
  setupLanguageSwitchers(){
    const langs = ['ca', 'es', 'fr', 'en', 'it'];
    document.querySelectorAll('.flags img, .flags-mobile img').forEach((img, i) => {
      const lang = langs[i % 5];
      img.style.cursor = 'pointer';
      img.addEventListener('click', async (e) => {
        e.preventDefault();
        if(lang !== this.currentLang){
          await this.loadLanguage(lang);
          this.applyTranslations();
          this.updateActiveFlags();
          this.setupWhatsAppLink();
        }
      });
    });
  },
  
  setupWhatsAppLink(){
    const whatsappLink = document.querySelector('.whatsapp-link');
    if(!whatsappLink) return;
    
    const messages = {
      ca: "Hola, em poso en contacte amb vosaltres des de la pàgina web de Bujóns Electrotècnics.",
      es: "Hola, me pongo en contacto con vosotros desde la página web de Bujóns Electrotècnics.",
      fr: "Bonjour, je vous contacte depuis le site web de Bujóns Electrotècnics.",
      en: "Hello, I'm contacting you from the Bujóns Electrotècnics website.",
      it: "Salve, vi contatto dal sito web di Bujóns Electrotècnics."
    };
    
    const message = messages[this.currentLang] || messages.ca;
    const phone = "34639036201";
    whatsappLink.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
};

// ── 2. ANIMACIONES SCROLL ──────────────────────────────────
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

// ── 3. MENÚ MÓVIL ──────────────────────────────────────────
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
  
  document.addEventListener('click', e => {
    if(!toggle.contains(e.target) && !menu.contains(e.target)){
      menu.classList.remove('open');
      toggle.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ── 4. VALIDACIÓN DEL FORMULARIO ───────────────────────────
function validateEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone){
  if(!phone) return true;
  return /^[+]?[\d\s\-()]{9,}$/.test(phone);
}

function showFieldError(input, message){
  input.classList.add('invalid');
  input.classList.remove('valid');
  let errorEl = input.nextElementSibling;
  if(!errorEl || !errorEl.classList.contains('field-error')){
    errorEl = document.createElement('div');
    errorEl.className = 'field-error';
    input.parentNode.insertBefore(errorEl, input.nextSibling);
  }
  errorEl.textContent = message;
  errorEl.classList.add('show');
}

function hideFieldError(input){
  input.classList.remove('invalid');
  input.classList.add('valid');
  const errorEl = input.nextElementSibling;
  if(errorEl && errorEl.classList.contains('field-error')){
    errorEl.classList.remove('show');
  }
}

function showSuccessBanner(message){
  let banner = document.querySelector('.success-banner');
  if(!banner){
    banner = document.createElement('div');
    banner.className = 'success-banner';
    document.body.appendChild(banner);
  }
  banner.textContent = message;
  banner.classList.add('show');
  
  setTimeout(() => {
    banner.classList.remove('show');
  }, 5000);
}

// ── 5. FORMULARIO ──────────────────────────────────────────
const form = document.getElementById('contact-form');
if(form){
  const nameInput = form.querySelector('[name="name"]');
  const emailInput = form.querySelector('[name="email"]');
  const phoneInput = form.querySelector('[name="phone"]');
  const messageInput = form.querySelector('[name="message"]');
  
  if(nameInput){
    nameInput.addEventListener('blur', () => {
      if(nameInput.value.trim().length < 2){
        showFieldError(nameInput, i18n.get('form.error_name') || 'Nom massa curt');
      }else{
        hideFieldError(nameInput);
      }
    });
  }
  
  if(emailInput){
    emailInput.addEventListener('blur', () => {
      if(!validateEmail(emailInput.value.trim())){
        showFieldError(emailInput, i18n.get('form.error_email') || 'Correu invàlid');
      }else{
        hideFieldError(emailInput);
      }
    });
  }
  
  if(phoneInput){
    phoneInput.addEventListener('blur', () => {
      const phone = phoneInput.value.trim();
      if(phone && !validatePhone(phone)){
        showFieldError(phoneInput, i18n.get('form.error_phone') || 'Telèfon invàlid');
      }else{
        hideFieldError(phoneInput);
      }
    });
  }
  
  if(messageInput){
    messageInput.addEventListener('blur', () => {
      if(messageInput.value.trim().length < 10){
        showFieldError(messageInput, i18n.get('form.error_message') || 'Missatge massa curt');
      }else{
        hideFieldError(messageInput);
      }
    });
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const message = messageInput.value.trim();
    
    console.log('📧 Form submission started');
    
    let hasErrors = false;
    
    if(name.length < 2){
      showFieldError(nameInput, i18n.get('form.error_name') || 'Nom massa curt');
      hasErrors = true;
    }
    
    if(!validateEmail(email)){
      showFieldError(emailInput, i18n.get('form.error_email') || 'Correu invàlid');
      hasErrors = true;
    }
    
    if(phone && !validatePhone(phone)){
      showFieldError(phoneInput, i18n.get('form.error_phone') || 'Telèfon invàlid');
      hasErrors = true;
    }
    
    if(message.length < 10){
      showFieldError(messageInput, i18n.get('form.error_message') || 'Missatge massa curt');
      hasErrors = true;
    }
    
    if(hasErrors) return;
    
    let token = null;
    const turnstileInput = document.querySelector('[name="cf-turnstile-response"]');
    if(turnstileInput){
      token = turnstileInput.value;
      console.log('🔒 Turnstile token:', token ? 'OK' : 'MISSING');
    }
    
    if(!token){
      alert(i18n.get('form.error_captcha') || 'Completa la verificació de seguretat.');
      return;
    }
    
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = i18n.get('form.sending') || 'Enviant...';
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if(phone) formData.append('phone', phone);
    formData.append('message', message);
    formData.append('cf-turnstile-response', token);
    formData.append('_subject', `Nou missatge de ${name}`);
    
    console.log('📤 Sending to Formspree...');
    
    try {
      const res = await fetch('https://formspree.io/f/mzdylwoe', {
        method: 'POST',
        body: formData,
        headers: {'Accept': 'application/json'}
      });
      
      console.log('📬 Response:', res.status);
      const data = await res.json();
      
      if(res.ok){
        showSuccessBanner(i18n.get('form.success') || '✅ Missatge enviat!');
        form.reset();
        document.querySelectorAll('input, textarea').forEach(el => {
          el.classList.remove('valid', 'invalid');
        });
        if(window.turnstile) window.turnstile.reset();
      }else{
        console.error('❌ Error:', data);
        alert(i18n.get('form.error') || '❌ Error: ' + (data.error || 'Unknown'));
      }
    }catch(err){
      console.error('❌ Network error:', err);
      alert(i18n.get('form.error') || '❌ Error de connexió');
    }finally{
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
});

})();
