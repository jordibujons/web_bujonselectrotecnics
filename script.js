
document.addEventListener('DOMContentLoaded',()=>{
  const os = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.style.opacity=1; e.target.style.transform='translateY(0)'; os.unobserve(e.target); } });
  },{threshold:.12});
  document.querySelectorAll('.service,.card').forEach(el=>{
    el.style.opacity=.01; el.style.transform='translateY(10px)'; el.style.transition='all .5s ease';
    os.observe(el);
  });
});
