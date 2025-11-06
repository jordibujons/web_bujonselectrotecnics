const YEAR = new Date().getFullYear();
document.getElementById('year').textContent = YEAR;
const supported = ["ca","es","fr","en"];
const langSelect = document.getElementById('lang');
const statusEl = document.getElementById('status');
let dict = null;
function getInitialLang(){ const saved = localStorage.getItem("lang"); if (saved && supported.includes(saved)) return saved; const nav=(navigator.language||"ca").slice(0,2); return supported.includes(nav)?nav:"ca"; }
function setLang(l){ localStorage.setItem("lang", l); document.documentElement.lang = l; langSelect.value = l; loadDict(l); }
async function loadDict(l){ try{ const res = await fetch(`i18n/${l}.json`); dict = await res.json(); applyI18n(); }catch(e){ console.error("i18n load error", e); } }
function applyI18n(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{ const key = el.getAttribute("data-i18n"); const value = key.split(".").reduce((o,k)=>(o||{})[k], dict); if (typeof value === "string") el.textContent = value; });
  const cards = document.getElementById("services-cards"); cards.innerHTML="";
  dict.services.items.forEach(item=>{ const a=document.createElement("article"); a.className="card"; a.innerHTML=`<h4>${item.h}</h4><p>${item.p}</p>`; cards.appendChild(a); });
  const list = document.getElementById("capabilities-list"); list.innerHTML="";
  dict.capabilities.list.forEach(txt=>{ const li=document.createElement("li"); li.textContent=txt; list.appendChild(li); });
}
function t(path){ return path.split(".").reduce((o,k)=>(o||{})[k], dict) || path; }
const form = document.getElementById("contact-form");
function setError(input, message){ const small=input.parentElement.querySelector(".error"); if(small){ small.textContent = message || ""; } input.setAttribute("aria-invalid", message ? "true" : "false"); }
form.addEventListener("submit", async (e)=>{
  e.preventDefault(); let ok=true;
  const name=form.name, email=form.email, message=form.message;
  if(!name.value || name.value.trim().length<2){ setError(name,"·"); ok=false;} else setError(name,"");
  if(!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)){ setError(email,"·"); ok=false;} else setError(email,"");
  if(!message.value || message.value.trim().length<10){ setError(message,"·"); ok=false;} else setError(message,"");
  if(!ok) return;
  statusEl.hidden=false; statusEl.textContent=t("contact.sending");
  try{
    const endpoint="https://formspree.io/f/YOUR_ENDPOINT"; // replace
    const resp = await fetch(endpoint,{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ name:name.value, email:email.value, message:message.value, lang: localStorage.getItem("lang")||"ca" })});
    if(resp.ok){ statusEl.textContent=t("contact.sent"); form.reset(); setTimeout(()=>statusEl.hidden=true,1500); }
    else { statusEl.textContent="Error"; setTimeout(()=>statusEl.hidden=true,1500); }
  }catch(err){ statusEl.textContent="Error"; setTimeout(()=>statusEl.hidden=true,1500); }
});
langSelect.addEventListener("change",(e)=> setLang(e.target.value));
setLang(getInitialLang());
