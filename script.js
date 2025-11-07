document.addEventListener('DOMContentLoaded',()=>{
  const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.style.transform='translateY(0)';e.target.style.opacity=1;obs.unobserve(e.target);}})},{threshold:.1});
  document.querySelectorAll('.panel,.card').forEach(el=>{el.style.transform='translateY(10px)';el.style.opacity=.01;el.style.transition='all .6s ease';obs.observe(el)});
});