/* scripts.js — fragment loader + page interactivity */
(async function(){
  // ----- fragment loader -----
  async function loadFragments(){
    const nodes = document.querySelectorAll('[data-include]');
    for(const n of nodes){
      const src = n.getAttribute('data-include');
      try{
        const res = await fetch(src);
        if(!res.ok) { console.warn('Failed to load', src); n.innerHTML = ''; continue; }
        const text = await res.text();
        n.innerHTML = text;
      }catch(err){
        console.error('Error loading fragment', src, err);
      }
    }
  }
  await loadFragments();

  // After fragments loaded, initialize page behaviors
  initPage();
})();

function initPage(){
  // theme toggle
  const html = document.documentElement;
  const themeBtn = document.getElementById('themeBtn');
  const stored = localStorage.getItem('cognify_theme');
  if(stored === 'dark') html.classList.add('theme-dark');
  if(themeBtn){
    themeBtn.addEventListener('click', () => {
      const applied = html.classList.toggle('theme-dark');
      localStorage.setItem('cognify_theme', applied ? 'dark' : 'light');
      themeBtn.setAttribute('aria-pressed', applied ? 'true' : 'false');
    });
    themeBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); themeBtn.click(); }});
  }

  // canvas background (as before)
  (function bgCanvas(){
    const canvas = document.getElementById('bgCanvas');
    if(!canvas) return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d', {alpha:true});
    const MAX_DPR = 2;
    let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    function resize(){
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    function draw(now){
      resize();
      const w = canvas.width/dpr, h = canvas.height/dpr;
      ctx.clearRect(0,0,w,h);
      const g = ctx.createLinearGradient(0,0,0,h);
      if(html.classList.contains('theme-dark')){
        g.addColorStop(0, 'rgba(6,12,24,0.7)');
        g.addColorStop(1, 'rgba(3,7,18,0.7)');
      } else {
        g.addColorStop(0, 'rgba(255,255,255,0.98)');
        g.addColorStop(1, 'rgba(248,250,252,0.96)');
      }
      ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
      const t = now * 0.001;
      const layers = [
        {amp:30, wl:460, speed:0.18, color: 'rgba(79,70,229,0.12)', baseline: 0.58},
        {amp:18, wl:300, speed:0.12, color: 'rgba(20,184,166,0.08)', baseline: 0.66},
        {amp:10, wl:180, speed:0.07, color: 'rgba(245,158,11,0.06)', baseline: 0.74}
      ];
      for(const L of layers){
        ctx.beginPath(); ctx.moveTo(0,h);
        const base = Math.round(h * L.baseline);
        for(let x=0;x<=w;x+=12){
          const th = (x / L.wl) * Math.PI * 2;
          const y = base + Math.sin(th + t * L.speed * 2*Math.PI) * L.amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w,h); ctx.closePath();
        ctx.fillStyle = L.color; ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
    window.addEventListener('resize', resize, {passive:true});
  })();

  // modal + topic wiring
  (function topicModal(){
    const topics = document.querySelectorAll('.topic');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const priceModal = document.getElementById('priceModal');
    const modalTopic = document.getElementById('modalTopic');
    const modalClose = document.getElementById('modalClose');
    const modalClose2 = document.getElementById('modalClose2');
    const modalSignup = document.getElementById('modalSignup');
    if(!topics.length || !modalBackdrop) return;

    function openModal(topic){
      modalTopic.textContent = topic;
      modalBackdrop.style.display = 'flex';
      modalBackdrop.setAttribute('aria-hidden','false');
      requestAnimationFrame(()=> priceModal.classList.add('show'));
      modalSignup.focus();
    }
    function closeModal(){
      priceModal.classList.remove('show');
      modalBackdrop.setAttribute('aria-hidden','true');
      setTimeout(()=> modalBackdrop.style.display = 'none', 260);
    }

    topics.forEach(t => {
      t.addEventListener('click', () => openModal(t.dataset.topic || (t.textContent||'Topic')));
      t.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(t.dataset.topic || (t.textContent||'Topic')); } });
    });
    modalClose.addEventListener('click', closeModal);
    modalClose2.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e)=> { if(e.target === modalBackdrop) closeModal(); });
    document.addEventListener('keydown', (e)=> { if(e.key === 'Escape') closeModal(); });
  })();

  // feedback horizontal carousel
  (function feedbackCarousel(){
    const data = [
      {name:'Aisha', text:'Built my first product feature — clear small tasks kept me focused.', rating:5, color:'#4F46E5'},
      {name:'Ravi', text:'Projects were practical and helped my portfolio.', rating:5, color:'#14B8A6'},
      {name:'Priya', text:'Affordable phases; I completed Basic and Beginner quickly.', rating:4, color:'#F59E0B'},
      {name:'Sameer', text:'The certificate process was smooth and professional.', rating:5, color:'#2563EB'},
      {name:'Maya', text:'Loved the hands-on projects and small deliverables.', rating:5, color:'#7C3AED'},
      {name:'Arjun', text:'Great pacing; I shipped deployable code.', rating:5, color:'#06B6D4'},
      {name:'Nisha', text:'Community helpful for peer reviews despite no mentor.', rating:4, color:'#F97316'},
      {name:'Vikram', text:'Realistic tasks, good for interviews.', rating:5, color:'#0EA5A4'},
      {name:'Sana', text:'Affordable and certificate is valued by employers.', rating:5, color:'#DB2777'},
      {name:'Diego', text:'Enjoyed the data topics and clarity of instructions.', rating:5, color:'#065F46'}
    ];
    const container = document.getElementById('feedbackHorizontal');
    if(!container) return;
    // build cards
    data.forEach((f, i) => {
      const card = document.createElement('div');
      card.className = 'fb-card';
      card.innerHTML = `
        <div class="avatar" style="background:${f.color}">${f.name.slice(0,2).toUpperCase()}</div>
        <div class="fb-body">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div><strong>${f.name}</strong><div class="muted" style="font-size:13px">Student</div></div>
            <div class="stars" aria-hidden="true">${'★'.repeat(f.rating)}${'☆'.repeat(5-f.rating)}</div>
          </div>
          <p style="margin-top:8px;color:var(--muted)">${f.text}</p>
        </div>
      `;
      container.appendChild(card);
    });

    const prev = document.getElementById('fbPrev');
    const next = document.getElementById('fbNext');
    const items = container.querySelectorAll('.fb-card');
    let idx = 0;
    function scrollToIndex(i){
      const item = items[i];
      if(!item) return;
      item.scrollIntoView({behavior: (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'), inline: 'center', block:'nearest'});
    }
    prev && prev.addEventListener('click', ()=> { idx = (idx - 1 + items.length) % items.length; scrollToIndex(idx); stopAuto(); });
    next && next.addEventListener('click', ()=> { idx = (idx + 1) % items.length; scrollToIndex(idx); stopAuto(); });

    // keyboard arrows
    container.addEventListener('keydown', (e) => {
      if(e.key === 'ArrowRight' || e.key === 'ArrowDown'){ e.preventDefault(); next && next.click(); }
      if(e.key === 'ArrowLeft' || e.key === 'ArrowUp'){ e.preventDefault(); prev && prev.click(); }
    });

    // autoplay
    let auto = true; let timer = null;
    function startAuto(){
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      stopAuto();
      timer = setInterval(()=> { idx = (idx + 1) % items.length; scrollToIndex(idx); }, 2800);
    }
    function stopAuto(){ if(timer) clearInterval(timer); timer = null; }
    startAuto();

    // stop auto when user interacts
    [prev,next,container].forEach(n => n && n.addEventListener('mouseover', ()=> { stopAuto(); auto = false; }));
    [prev,next,container].forEach(n => n && n.addEventListener('mouseout', ()=> { if(auto) startAuto(); }));
  })();

  // footer year
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
}
