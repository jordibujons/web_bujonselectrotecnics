function validateForm(e){
  e.preventDefault();
  var name=document.getElementById('name').value.trim();
  var email=document.getElementById('email').value.trim();
  var msg=document.getElementById('message').value.trim();
  if(!name||!email||!msg){ alert('Si us plau, omple tots els camps.'); return false; }
  var tokenOk = (typeof grecaptcha!=='undefined'); // UI requires reCAPTCHA tick
  if(tokenOk && grecaptcha.getResponse().length===0){ alert('Marca el reCAPTCHA.'); return false; }
  fetch('https://formspree.io/f/YOUR_ENDPOINT',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ name:name, email:email, message:msg })
  }).then(r=>{
    if(r.ok){ alert('Missatge enviat correctament!'); e.target.reset(); if(tokenOk) grecaptcha.reset(); }
    else{ alert('Hi ha hagut un error en l\'enviament.'); }
  }).catch(()=> alert('Hi ha hagut un error en l\'enviament.'));
  return false;
}