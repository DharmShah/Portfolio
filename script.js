/* =========================================================
   DHARM.GAI — Portfolio interaction layer
   Organized per-feature init functions, called from init() at bottom.
   ========================================================= */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------
   PROJECT DATA — sourced only from the supplied resume.
   No invented metrics, no invented URLs.
--------------------------------------------------------- */
const PROJECTS = [
  {
    n: '01',
    title: 'AI Workspace Assistant',
    tag: 'MCP-Based Chat, Calendar & Notion Automation Agent',
    arch: ['USER', 'LLM', 'AGENT', 'MCP', '├── GOOGLE CALENDAR', '├── GMAIL', '└── NOTION'],
    desc: 'An MCP (Model Context Protocol) chatbot that lets users manage their work entirely through natural conversation.',
    features: [
      'Google OAuth 2.0 integration so the agent securely authenticates and acts on the user\u2019s behalf across Google services.',
      'Saves chat-derived content directly to Notion and auto-creates corresponding Google Calendar events.',
      'Automated sharing — sends the generated Notion page link to teammates via the Gmail API, removing manual hand-off.'
    ],
    stack: ['Python', 'MCP', 'LangChain', 'Google OAuth 2.0', 'Calendar API', 'Gmail API', 'Notion API'],
    github: null,
    githubLabel: 'Private Repository',
    demo: null
  },
  {
    n: '02',
    title: 'TrueWrite AI',
    tag: 'Content Detection & Humanization Platform',
    arch: ['TEXT', 'AI DETECTION', 'LLM AGENT', 'HUMANIZATION'],
    desc: 'An AI system that estimates the AI-generated vs. human-written likelihood of a given text.',
    features: [
      'LLM-agent-based content humanization using advanced prompt engineering techniques.'
    ],
    stack: ['Python', 'LLM Agents', 'Prompt Engineering'],
    github: 'https://github.com/DharmShah/AI_Detector_Humanizer.git',
    demo: null
  },
  {
    n: '03',
    title: 'CVForge AI',
    tag: 'Multi-Agent Resume Optimization System',
    arch: ['RESUME', 'OCR', 'AGENTS', 'ATS ANALYSIS', 'OPTIMIZED RESUME'],
    desc: 'A full-stack ATS-friendly resume builder built with ReactJS and Flask, driven by a LangChain multi-agent pipeline via OpenRouter for resume analysis and suggestions.',
    features: [
      'OCR-based resume parsing for extracting structured data from uploaded resumes.',
      'Whisper voice-to-text input for hands-free resume editing.',
      'ATS scoring engine that returns actionable feedback.'
    ],
    stack: ['ReactJS', 'Flask', 'LangChain', 'OpenRouter', 'OCR', 'Whisper'],
    github: 'https://github.com/DharmShah/ResumeBuilder.git',
    demo: null
  },
  {
    n: '04',
    title: 'E-Waiter 2.0',
    tag: 'Restaurant Order & Staff Management System',
    arch: ['ADMIN', 'WAITER', 'CHEF', 'CUSTOMER'],
    desc: 'A full-stack restaurant management platform with role-based dashboards for Admin, Waiter, Chef and Customer.',
    features: [
      'End-to-end order flow and table management to streamline restaurant operations across roles.'
    ],
    stack: ['PHP', 'MySQL'],
    github: 'https://github.com/DharmShah/E-Waiter2.0',
    demo: null
  },
  {
    n: '05',
    title: 'RAG Console Q&A Bot',
    tag: 'Retrieval-Augmented Question Answering Engine',
    arch: ['QUERY', 'RETRIEVAL', 'CONTEXT', 'LLM', 'ANSWER'],
    desc: 'A Flask-based RAG application that retrieves context and generates accurate console-based answers to user queries.',
    features: [],
    stack: ['Flask', 'RAG', 'Vector Embeddings'],
    github: 'https://github.com/DharmShah/RAGConsoleBaseQuestionInput',
    demo: null
  }
];

/* ---------------------------------------------------------
   LENIS — smooth scrolling, wired into GSAP ticker
--------------------------------------------------------- */
function initLenis(){
  if (REDUCED_MOTION) return null;
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/* ---------------------------------------------------------
   FACE / IDENTITY SEQUENCE
   Only 5 real images exist in /assets (no 240-frame export was
   ever generated). This renders a canvas crossfade between them,
   driven by scroll, using RELATIVE paths so it works regardless
   of Vercel root-directory settings.
--------------------------------------------------------- */
function initFaceSequence(){
  const canvas = document.getElementById('identity-animation');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const loader = document.getElementById('animation-loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderText = document.getElementById('loader-text');

  const hudFill = document.getElementById('hud-fill');
  const hudPercent = document.getElementById('hud-percent');
  const hudLabel = document.getElementById('hud-label');
  const sweep = document.getElementById('scan-sweep');

  const FRAME_FILES = [
    'assets/cartoon-front.jpg',
    'assets/cartoon-back.jpg',
    'assets/transition-profile.jpg',
    'assets/real-office.jpg',
    'assets/real-headshot-cutout.png'
  ];
  const TOTAL_FRAMES = FRAME_FILES.length;
  const images = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let errorCount = 0;

  const labels = [
    { max: 0.20, text: 'DIGITAL<br>IDENTITY' },
    { max: 0.45, text: 'NEURAL<br>TRANSFORMATION' },
    { max: 0.70, text: 'SYSTEM<br>SYNTHESIS' },
    { max: 0.90, text: 'REALITY<br>INITIALIZING' },
    { max: 1.001, text: 'IDENTITY<br>REVEALED' }
  ];

  let targetProgress = 0;
  let currentProgress = 0;

  function resizeCanvas(){
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    paint(currentProgress);
  }

  function drawImageCover(img, alpha){
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const cw = canvas.width, ch = canvas.height;
    if (!cw || !ch) return;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = (cw - dw) / 2, dy = (ch - dh) * 0.15;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
  }

  function paint(p){
    const cw = canvas.width, ch = canvas.height;
    if (!cw || !ch) return;
    const clampedP = Math.min(1, Math.max(0, p));
    const pos = clampedP * (TOTAL_FRAMES - 1);
    const idx = Math.min(TOTAL_FRAMES - 2, Math.floor(pos));
    const frac = pos - idx;

    ctx.clearRect(0, 0, cw, ch);
    if (images[idx]) drawImageCover(images[idx], 1);
    if (images[idx + 1] && frac > 0) drawImageCover(images[idx + 1], frac);

    const pct = Math.round(clampedP * 100);
    if (hudFill) hudFill.style.width = pct + '%';
    if (hudPercent) hudPercent.textContent = String(pct).padStart(2, '0') + '%';

    const l = labels.find(item => clampedP <= item.max) || labels[labels.length - 1];
    if (hudLabel && hudLabel.innerHTML !== l.text) hudLabel.innerHTML = l.text;

    if (sweep && !REDUCED_MOTION){
      const distToBoundary = Math.min(frac, 1 - frac);
      sweep.style.opacity = Math.max(0, 0.35 - distToBoundary * 1.4);
    }
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function loadFrame(index){
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        images[index] = img;
        loadedCount++;
        updateLoadingProgress();
        if (index === 0) paint(0);
        resolve(img);
      };
      img.onerror = () => {
        errorCount++;
        console.error(`Failed to load frame ${index}:`, FRAME_FILES[index]);
        updateLoadingProgress();
        resolve(null);
      };
      img.src = FRAME_FILES[index];
    });
  }

  function updateLoadingProgress(){
    const totalProcessed = loadedCount + errorCount;
    const percent = Math.round((totalProcessed / TOTAL_FRAMES) * 100);
    if (loaderBar) loaderBar.style.width = percent + '%';
    if (errorCount > 0 && loadedCount === 0){
      if (loaderText) loaderText.textContent = 'ANIMATION ASSET ERROR — CHECK /assets PATH';
    } else {
      if (loaderText) loaderText.textContent = `LOADING FRAMES ${percent}%`;
    }
    if (totalProcessed === TOTAL_FRAMES){
      if (loader){
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
      }
      paint(currentProgress);
    }
  }

  for (let i = 0; i < TOTAL_FRAMES; i++) loadFrame(i);

  if (REDUCED_MOTION){
    const img = new Image();
    img.onload = () => {
      images[TOTAL_FRAMES - 1] = img;
      paint(1);
      if (loader) loader.style.display = 'none';
    };
    img.src = FRAME_FILES[TOTAL_FRAMES - 1];
    return;
  }

  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: '+=3600',
    pin: true,
    scrub: 0.5,
    onUpdate: self => { targetProgress = self.progress; }
  });

  function render(){
    currentProgress += (targetProgress - currentProgress) * 0.18;
    if (Math.abs(currentProgress - targetProgress) < 0.0003) currentProgress = targetProgress;
    paint(currentProgress);
    requestAnimationFrame(render);
  }
  render();
}

/* ---------------------------------------------------------
   SCROLL-TRIGGERED FADE-UPS
--------------------------------------------------------- */
function initScrollAnimation(){
  const items = gsap.utils.toArray('[data-fade]');
  items.forEach((el, i) => {
    if (REDUCED_MOTION){ gsap.set(el, { opacity: 1, y: 0 }); return; }
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
      delay: (i % 4) * 0.05
    });
  });

  gsap.utils.toArray('.node').forEach((node) => {
    ScrollTrigger.create({
      trigger: node,
      start: 'top 80%',
      onEnter: () => node.classList.add('lit'),
    });
  });

  const line = document.getElementById('timeline-line');
  if (line && !REDUCED_MOTION){
    gsap.fromTo(line, { scaleY: 0 }, {
      scaleY: 1, transformOrigin: 'top', ease: 'none',
      scrollTrigger: { trigger: '#experience', start: 'top 70%', end: 'bottom 80%', scrub: true }
    });
  }
}

/* ---------------------------------------------------------
   PARTICLE BACKGROUND — lightweight canvas field
--------------------------------------------------------- */
function initParticles(){
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles;
  const isSmall = window.innerWidth < 768;
  const COUNT = REDUCED_MOTION ? 0 : (isSmall ? 55 : 110);

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.12,
    vy: (Math.random() - 0.5) * 0.12,
    r: Math.random() * 1.3 + 0.3,
    hue: Math.random() > 0.5 ? '91,157,255' : '255,154,82',
    a: Math.random() * 0.5 + 0.15
  }));

  let mx = w / 2, my = h / 2;
  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

  function tick(){
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      const dx = mx - p.x, dy = my - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 160){
        p.x -= dx * 0.0009;
        p.y -= dy * 0.0009;
      }
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  if (COUNT > 0) tick();
}

/* ---------------------------------------------------------
   CUSTOM CURSOR
--------------------------------------------------------- */
function initCursor(){
  if (window.innerWidth < 900) return;
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let dx = 0, dy = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', e => { dx = e.clientX; dy = e.clientY; });

  function loop(){
    rx += (dx - rx) * 0.18;
    ry += (dy - ry) * 0.18;
    dot.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const word = el.getAttribute('data-cursor') || (el.closest('.project-panel') ? 'VIEW' : 'EXPLORE');
      ring.style.width = '58px'; ring.style.height = '58px';
      ring.style.borderColor = 'rgba(91,157,255,0.6)';
      ring.style.background = 'rgba(91,157,255,0.06)';
      ring.textContent = word;
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = '34px'; ring.style.height = '34px';
      ring.style.borderColor = 'rgba(255,255,255,0.35)';
      ring.style.background = 'transparent';
      ring.textContent = '';
    });
  });
}

/* ---------------------------------------------------------
   PROJECTS — render panels + overlay interactions
--------------------------------------------------------- */
function initProjectInteractions(){
  const list = document.getElementById('projects-list');
  list.innerHTML = PROJECTS.map(p => `
    <div class="project-panel border-t border-line last:border-b last:border-line max-[900px]:cursor-pointer hover:bg-white/[0.015] transition-colors duration-[400ms] px-6 md:px-16 py-10 md:py-14 grid md:grid-cols-12 gap-6 items-center cursor-pointer" data-idx="${p.n}" data-cursor="VIEW">
      <span class="md:col-span-1 font-mono text-sm text-inkfaint">${p.n}</span>
      <div class="md:col-span-5">
        <h3 class="font-display text-2xl md:text-4xl text-ink">${p.title}</h3>
        <p class="text-sm mt-2 max-w-md text-inkdim">${p.tag}</p>
      </div>
      <div class="md:col-span-5 project-arch font-mono text-[11px] text-inkfaint">
        ${p.arch.map(a => `<div>${a}</div>`).join('')}
      </div>
      <div class="md:col-span-1 flex md:justify-end">
        <span class="font-mono tracking-[.1em] text-[10px] text-inkfaint">${p.github ? 'OPEN →' : 'PRIVATE'}</span>
      </div>
    </div>
  `).join('');

  const overlay = document.getElementById('project-overlay');
  const content = document.getElementById('overlay-content');

  list.querySelectorAll('.project-panel').forEach(panel => {
    panel.addEventListener('click', () => {
      const p = PROJECTS.find(pr => pr.n === panel.dataset.idx);
      content.innerHTML = `
        <p class="font-mono text-xs tracking-[.15em] mb-4 text-blue">PROJECT ${p.n}</p>
        <h3 class="font-display text-4xl md:text-6xl mb-3 text-ink">${p.title}</h3>
        <p class="mb-10 text-inkdim">${p.tag}</p>

        <p class="font-mono text-[11px] tracking-[.15em] mb-3 text-inkfaint">DESCRIPTION</p>
        <p class="leading-relaxed mb-10 max-w-2xl text-inkdim">${p.desc}</p>

        <p class="font-mono text-[11px] tracking-[.15em] mb-3 text-inkfaint">ARCHITECTURE</p>
        <div class="project-arch mb-10 text-sm leading-loose">${p.arch.join('  →  ')}</div>

        ${p.features.length ? `
        <p class="font-mono text-[11px] tracking-[.15em] mb-3 text-inkfaint">KEY FEATURES</p>
        <ul class="leading-relaxed mb-10 max-w-2xl text-inkdim flex flex-col gap-2">
          ${p.features.map(f => `<li>— ${f}</li>`).join('')}
        </ul>` : ''}

        <p class="font-mono text-[11px] tracking-[.15em] mb-3 text-inkfaint">TECH STACK</p>
        <div class="flex flex-wrap gap-2 mb-12">
          ${p.stack.map(s => `<span class="skill-chip">${s}</span>`).join('')}
        </div>

        <div class="flex flex-wrap gap-4">
          ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener" class="btn-line" data-cursor="OPEN">GITHUB</a>` : `<span class="btn-line opacity-50 cursor-default">${p.githubLabel || 'SOURCE NOT PUBLIC'}</span>`}
          ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener" class="btn-line" data-cursor="OPEN">LIVE DEMO</a>` : ''}
        </div>
      `;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  document.getElementById('overlay-close').addEventListener('click', () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay){
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ---------------------------------------------------------
   NAVIGATION — smooth anchor scroll + active rail sync
--------------------------------------------------------- */
function initNavigation(lenis){
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      closeMobileNav();
      if (lenis) lenis.scrollTo(target, { duration: 1.2 });
      else target.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    });
  });

  const toggle = document.getElementById('mobile-nav-toggle');
  const panel = document.getElementById('mobile-nav-panel');
  function closeMobileNav(){
    panel.classList.add('hidden'); panel.classList.remove('flex');
    document.body.style.overflow = '';
  }
  if (toggle){
    toggle.addEventListener('click', () => {
      const isOpen = panel.classList.contains('flex');
      if (isOpen) closeMobileNav();
      else { panel.classList.remove('hidden'); panel.classList.add('flex'); document.body.style.overflow = 'hidden'; }
    });
  }
  const closeBtn = document.getElementById('mobile-nav-close');
  if (closeBtn) closeBtn.addEventListener('click', closeMobileNav);

  const railItems = document.querySelectorAll('.rail-item');
  const sectionIds = ['hero', 'architecture', 'experience', 'projects', 'contact'];
  sectionIds.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 55%',
      end: 'bottom 55%',
      onEnter: () => setActiveRail(i),
      onEnterBack: () => setActiveRail(i),
    });
  });
  function setActiveRail(i){
    railItems.forEach((item, idx) => {
      item.classList.toggle('active', idx === i);
      item.querySelector('.rail-dot').classList.toggle('active', idx === i);
    });
  }

  document.querySelectorAll('.rail-item').forEach((item, i) => {
    item.addEventListener('click', () => {
      const el = document.getElementById(item.dataset.target);
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { duration: 1.2 });
      else el.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    });
    item.style.cursor = 'pointer';
  });
}

/* ---------------------------------------------------------
   BOOT
--------------------------------------------------------- */
function init(){
  gsap.registerPlugin(ScrollTrigger);
  const lenis = initLenis();
  initFaceSequence();
  initScrollAnimation();
  initParticles();
  initCursor();
  initProjectInteractions();
  initNavigation(lenis);
}

document.addEventListener('DOMContentLoaded', init);