document.addEventListener('DOMContentLoaded',()=>{
  // ── 1. Animaciones scroll (original) ──
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.style.opacity=1;e.target.style.transform='translateY(0)';io.unobserve(e.target);}})},{threshold:.18});
  document.querySelectorAll('.card,.panel').forEach(el=>{el.style.opacity=.01;el.style.transform='translateY(10px)';el.style.transition='all .45s ease';io.observe(el)});

  // ── 2. Cambio de idioma inteligente (NUEVO) ──
  const LANG_MAP={'cat':'','es':'-es','fr':'-fr','en':'-en'};
  function getCurrentBase(){
    const file=(location.pathname.split('/').pop()||'index.html').replace('.html','');
    for(const suffix of ['-es','-fr','-en']){if(file.endsWith(suffix))return file.slice(0,-suffix.length)}
    return file;
  }
  function getCurrentLang(){
    const file=location.pathname.split('/').pop()||'index.html';
    if(file.includes('-es.'))return 'es';
    if(file.includes('-fr.'))return 'fr';
    if(file.includes('-en.'))return 'en';
    return 'cat';
  }
  function buildUrl(lang){return getCurrentBase()+LANG_MAP[lang]+'.html'}
  const currentLang=getCurrentLang();
  document.querySelectorAll('.flags a, .flags-mobile a').forEach((el,i)=>{
    const langs=['cat','es','fr','en'];
    const lang=langs[i%4];
    if(lang){
      el.href=buildUrl(lang);
      if(lang===currentLang)el.style.opacity='1';
    }
  });

  // ── 3. Menú móvil toggle (NUEVO) ──
  const toggle=document.querySelector('.nav-toggle');
  const menu=document.querySelector('.mobile-menu');
  if(toggle && menu){
    toggle.addEventListener('click',()=>{
      const isOpen=menu.classList.toggle('open');
      toggle.classList.toggle('open',isOpen);
      document.body.style.overflow=isOpen?'hidden':'';
    });
    menu.querySelectorAll('a').forEach(link=>{
      link.addEventListener('click',()=>{
        menu.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow='';
      });
    });
  }
});
