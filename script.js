/* ========================================================
   WEDDING INVITATION v2 — script.js
   GSAP 3 + Canvas Petals + Parallax + Sparkles + Countdown
======================================================== */
'use strict';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const rand = (a, b) => Math.random() * (b - a) + a;
const lerp = (a, b, t) => a + (b - a) * t;

/* ══════════════════════════════════════════════════
   1. FALLING PETALS — Canvas
══════════════════════════════════════════════════ */
;(function initPetals() {
  const canvas = $('#petals-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  const COUNT = window.innerWidth < 500 ? 22 : 35;
  const COLORS = [
    'rgba(224,168,168,0.75)', 'rgba(245,200,200,0.6)',
    'rgba(232,180,180,0.65)', 'rgba(255,218,218,0.55)',
    'rgba(205,155,160,0.62)', 'rgba(240,195,195,0.5)',
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Petal {
    constructor(spread) {
      this.init(spread);
    }
    init(spread = false) {
      this.x      = rand(0, W);
      this.y      = spread ? rand(-H, H) : rand(-180, -10);
      this.sz     = rand(5, 13);
      this.vy     = rand(0.35, 0.9);
      this.vx     = rand(-0.25, 0.25);
      this.angle  = rand(0, Math.PI * 2);
      this.spin   = rand(-0.018, 0.018);
      this.swayA  = rand(0.3, 1.0);
      this.swayF  = rand(0.006, 0.013);
      this.swayT  = rand(0, Math.PI * 2);
      this.sy     = rand(0.2, 1);   // 3D tumble scale
      this.sDir   = rand(0,1) > .5 ? 1 : -1;
      this.sSpd   = rand(.004, .009);
      this.color  = COLORS[Math.floor(rand(0, COLORS.length))];
      this.alpha  = rand(.5, .95);
    }
    update() {
      this.swayT += this.swayF;
      this.x += this.vx + Math.sin(this.swayT) * this.swayA;
      this.y += this.vy;
      this.angle += this.spin;
      this.sy += this.sDir * this.sSpd;
      if (this.sy >  1) { this.sy =  1; this.sDir = -1; }
      if (this.sy < -1) { this.sy = -1; this.sDir =  1; }
      if (this.y > H + 30) this.init();
    }
    draw() {
      const abs = Math.abs(this.sy);
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.scale(1, this.sy);
      ctx.globalAlpha = abs * this.alpha;
      ctx.fillStyle = this.color;
      // Teardrop petal
      ctx.beginPath();
      ctx.moveTo(0, -this.sz);
      ctx.bezierCurveTo( this.sz*.55, -this.sz*.45,  this.sz*.55,  this.sz*.55, 0,  this.sz);
      ctx.bezierCurveTo(-this.sz*.55,  this.sz*.55, -this.sz*.55, -this.sz*.45, 0, -this.sz);
      ctx.fill();
      // Highlight vein
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -this.sz * .7);
      ctx.lineTo(0,  this.sz * .7);
      ctx.stroke();
      ctx.restore();
    }
  }

  const petals = Array.from({ length: COUNT }, () => new Petal(true));
  let visible = true;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  function loop() {
    if (visible) {
      ctx.clearRect(0, 0, W, H);
      petals.forEach(p => { p.update(); p.draw(); });
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ══════════════════════════════════════════════════
   2. SPARKLE LAYER
══════════════════════════════════════════════════ */
;(function initSparkles() {
  const layer = $('#sparkle-layer');
  const COUNT = 14;
  for (let i = 0; i < COUNT; i++) {
    const sp = document.createElement('div');
    sp.className = 'sparkle';
    const size = rand(3, 8);
    Object.assign(sp.style, {
      left:     rand(5, 95) + '%',
      top:      rand(5, 95) + '%',
      width:    size + 'px',
      height:   size + 'px',
      '--dur':  rand(2.5, 5) + 's',
      '--delay':rand(0, 4) + 's',
    });
    layer.appendChild(sp);
  }
})();

/* ══════════════════════════════════════════════════
   3. PRELOADER
══════════════════════════════════════════════════ */
function runPreloader() {
  return new Promise(resolve => {
    const pl = $('#preloader');
    // Minimum display time + ensure fonts loaded
    const minTime = 1400;
    const start = Date.now();
    const done = () => {
      const elapsed = Date.now() - start;
      const wait = Math.max(0, minTime - elapsed);
      setTimeout(() => {
        gsap.to(pl, {
          opacity: 0, duration: .7, ease: 'power2.out',
          onComplete: () => {
            pl.classList.add('out');
            resolve();
          }
        });
      }, wait);
    };
    if (document.fonts) {
      document.fonts.ready.then(done);
    } else {
      done();
    }
  });
}

/* ══════════════════════════════════════════════════
   4. HERO ENTRANCE — staggered with character split
══════════════════════════════════════════════════ */
function initHero() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Branches bloom in
  tl.fromTo('#br-tl',
    { opacity:0, x:-100, y:-100, scale:.5, rotate:-20 },
    { opacity:1, x:0,    y:0,    scale:1,  rotate:0, duration:1.5, ease:'back.out(1.4)' }, 0)
  .fromTo('#br-br',
    { opacity:0, x:100,  y:100,  scale:.5, rotate:20 },
    { opacity:1, x:0,    y:0,    scale:1,  rotate:0, duration:1.5, ease:'back.out(1.4)' }, .1)
  .fromTo('#br-tr',
    { opacity:0, x:80,   y:-60,  scale:.4 },
    { opacity:.75,x:0,   y:0,    scale:1, duration:1.2, ease:'back.out(1.5)' }, .2)
  .fromTo('#br-bl',
    { opacity:0, x:-80,  y:60,   scale:.4 },
    { opacity:.75,x:0,   y:0,    scale:1, duration:1.2, ease:'back.out(1.5)' }, .2)

  // Birds
  .fromTo('#bird-fly',
    { opacity:0, x:60, y:-30 },
    { opacity:1, x:0,  y:0,  duration:1.1, ease:'power2.out' }, .7)
  .fromTo('#bird-sit',
    { opacity:0, y:25 },
    { opacity:1, y:0,  duration:.9, ease:'back.out(2)' }, .9)

  // Ribbon
  .fromTo('#hero-ribbon',
    { opacity:0, y:20, scaleX:0 },
    { opacity:1, y:0,  scaleX:1, duration:.8, transformOrigin:'center' }, .5)

  // H1 words: clip-path reveal
  .fromTo('.h1-word',
    { opacity:0, y:60, rotateX:-30 },
    { opacity:1, y:0,  rotateX:0, duration:.9,
      stagger:.12, ease:'power4.out', transformPerspective:600 }, .7)

  // Subtitle
  .fromTo('#hero-sub',
    { opacity:0, y:25, filter:'blur(3px)' },
    { opacity:1, y:0,  filter:'blur(0px)', duration:.8 }, 1.1)

  // Ornament
  .fromTo('#ornament',
    { opacity:0, scaleX:0 },
    { opacity:1, scaleX:1, duration:.7, ease:'power2.out', transformOrigin:'center' }, 1.3)

  // Names: slide from sides
  .fromTo('#name-groom',
    { opacity:0, x:-50, rotate:-5 },
    { opacity:1, x:0,   rotate:0, duration:1, ease:'back.out(1.8)' }, 1.4)
  .fromTo('#names-amp',
    { opacity:0, scale:.4 },
    { opacity:1, scale:1, duration:.7, ease:'back.out(2)' }, 1.55)
  .fromTo('#name-bride',
    { opacity:0, x:50, rotate:5 },
    { opacity:1, x:0,  rotate:0, duration:1, ease:'back.out(1.8)' }, 1.5)

  // Names shimmer glow burst
  .to(['#name-groom','#name-bride'], {
    textShadow:'0 0 30px rgba(196,96,122,.4)',
    duration:.4, yoyo:true, repeat:2, ease:'sine.inOut'
  }, 2.3)

  // Date
  .fromTo('#hero-date',
    { opacity:0, y:20 },
    { opacity:1, y:0, duration:.7 }, 1.8)
  .fromTo('.hd-num',
    { scale:.5, opacity:0 },
    { scale:1,  opacity:1, duration:.5, stagger:.1, ease:'back.out(2)' }, 1.9)

  // Countdown
  .fromTo('#countdown',
    { opacity:0, y:20, scale:.95 },
    { opacity:1, y:0,  scale:1, duration:.7, ease:'back.out(1.5)' }, 2.1)

  // Scroll cue
  .fromTo('#scroll-cue',
    { opacity:0, y:10 },
    { opacity:1, y:0, duration:.6 }, 2.4);
}

/* ══════════════════════════════════════════════════
   5. COUNTDOWN TIMER
══════════════════════════════════════════════════ */
function initCountdown() {
  const target = new Date('2026-10-11T15:00:00+05:00').getTime();
  const dEl = $('#cd-days'), hEl = $('#cd-hours'), mEl = $('#cd-mins'), sEl = $('#cd-secs');

  function pad(n) { return String(n).padStart(2, '0'); }

  function update() {
    const now  = Date.now();
    const diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const tick = (el, val) => {
      const v = pad(val);
      if (el.textContent !== v) {
        gsap.to(el, { opacity:0, y:-8, duration:.12, onComplete:() => {
          el.textContent = v;
          gsap.to(el, { opacity:1, y:0, duration:.15, ease:'power2.out' });
        }});
      }
    };
    tick(dEl, d); tick(hEl, h); tick(mEl, m); tick(sEl, s);
  }
  update();
  setInterval(update, 1000);
}

/* ══════════════════════════════════════════════════
   6. SCROLL ANIMATIONS — ScrollTrigger
══════════════════════════════════════════════════ */
function initScrollAnimations() {
  // Generic reveal helper
  const revealUp = (sel, trigger, delay = 0) => {
    gsap.to(sel, {
      opacity:1, y:0, duration:.85,
      ease:'power3.out', delay,
      scrollTrigger: { trigger, start:'top 78%', once:true }
    });
  };
  const revealLeft = (sel, trigger, delay = 0) => {
    gsap.to(sel, {
      opacity:1, x:0, duration:.85,
      ease:'power3.out', delay,
      scrollTrigger: { trigger, start:'top 78%', once:true }
    });
  };

  // Calendar
  revealUp('#ey-cal',    '#s-cal', 0);
  revealUp('#h2-cal',    '#s-cal', .12);
  revealUp('#cal-card',  '#s-cal', .25);

  // Timeline
  revealUp('#ey-time',  '#s-time', 0);
  revealUp('#h2-time',  '#s-time', .1);
  revealLeft('#tl-1',   '#s-time', .2);
  revealLeft('#tl-2',   '#s-time', .4);

  // Closing
  revealUp('#close-quote', '#s-close', 0);
  revealUp('#close-names', '#s-close', .2);
  revealUp('#close-badge', '#s-close', .35);
  revealUp('#hearts-row',  '#s-close', .5);

  // ── Heart draw animation ──
  initHeartDraw();
}

/* ══════════════════════════════════════════════════
   7. HEART DRAW (SVG stroke-dashoffset)
══════════════════════════════════════════════════ */
function initHeartDraw() {
  const hSvg  = $('#heart-svg');
  const hPath = $('#heart-path');
  const cd11  = $('#cd11');
  if (!hSvg || !cd11) return;

  function positionHeart() {
    const pRect = cd11.closest('.cal-card').getBoundingClientRect();
    const dRect = cd11.getBoundingClientRect();
    hSvg.style.left = (dRect.left - pRect.left - 15) + 'px';
    hSvg.style.top  = (dRect.top  - pRect.top  - 15) + 'px';
  }

  ScrollTrigger.create({
    trigger: '#cal-card', start: 'top 65%', once: true,
    onEnter: () => {
      setTimeout(() => {
        positionHeart();
        gsap.set(hSvg, { opacity:1 });
        // Draw heart from 0
        gsap.fromTo(hPath,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut',
            onComplete: () => {
              // Burst glow
              gsap.to(hPath, {
                filter: 'drop-shadow(0 0 12px rgba(212,96,122,.8))',
                duration: .4
              });
              // Pulse
              gsap.to(hSvg, {
                scale: 1.12, duration: .35,
                yoyo: true, repeat: 5,
                ease: 'sine.inOut',
                transformOrigin: 'center'
              });
            }
          }
        );
        // Shake day-11 when heart appears
        gsap.to(cd11, {
          scale: 1.5, color: '#d4607a', duration: .4,
          ease: 'back.out(3)',
          onComplete: () => {
            gsap.to(cd11, { scale:1, duration:.3, ease:'power2.out' });
          }
        });
      }, 500);
    }
  });
}

/* ══════════════════════════════════════════════════
   8. PARALLAX — Mouse + Gyro
══════════════════════════════════════════════════ */
function initParallax() {
  const config = [
    { sel:'#br-tl',     d:.028 },
    { sel:'#br-br',     d:.024 },
    { sel:'#br-tr',     d:.018 },
    { sel:'#br-bl',     d:.018 },
    { sel:'#bird-fly',  d:.045 },
    { sel:'#bird-sit',  d:.032 },
  ];

  const items = config.map(c => ({
    el: $(c.sel), depth: c.d,
    cx: 0, cy: 0, tx: 0, ty: 0
  }));

  let mx = 0, my = 0;
  const cx = () => window.innerWidth  / 2;
  const cy = () => window.innerHeight / 2;

  window.addEventListener('mousemove', e => {
    mx = e.clientX - cx();
    my = e.clientY - cy();
  }, { passive: true });

  if (typeof DeviceOrientationEvent !== 'undefined') {
    window.addEventListener('deviceorientation', e => {
      if (e.gamma != null && e.beta != null) {
        mx = (e.gamma / 45) * cx();
        my = ((e.beta - 30) / 45) * cy();
      }
    }, { passive: true });
  }

  ;(function parallaxRaf() {
    items.forEach(item => {
      if (!item.el) return;
      item.tx = mx * item.depth;
      item.ty = my * item.depth;
      item.cx = lerp(item.cx, item.tx, .055);
      item.cy = lerp(item.cy, item.ty, .055);
      gsap.set(item.el, { x: item.cx, y: item.cy, force3D: true });
    });
    requestAnimationFrame(parallaxRaf);
  })();
}

/* ══════════════════════════════════════════════════
   9. MAGNETIC NAMES (subtle follow-cursor)
══════════════════════════════════════════════════ */
function initMagneticNames() {
  ['#name-groom','#name-bride','#names-amp'].forEach(sel => {
    const el = $(sel);
    if (!el) return;
    el.addEventListener('mouseenter', () => {
      gsap.to(el, { scale:1.06, duration:.4, ease:'power2.out' });
    });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * .12;
      const dy = (e.clientY - (r.top  + r.height / 2)) * .12;
      gsap.to(el, { x:dx, y:dy, duration:.4, ease:'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x:0, y:0, scale:1, duration:.6, ease:'elastic.out(1,.5)' });
    });
  });
}

/* ══════════════════════════════════════════════════
   10. CALENDAR DAY HOVER
══════════════════════════════════════════════════ */
function initCalHover() {
  $$('.cd:not(:empty)').forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(el, { scale:1.25, duration:.18, ease:'back.out(2)' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { scale:1, duration:.22, ease:'power2.out' });
    });
  });
}

/* ══════════════════════════════════════════════════
   11. SCROLL CUE: hide on first scroll
══════════════════════════════════════════════════ */
function initScrollCue() {
  const el = $('#scroll-cue');
  if (!el) return;
  const hide = () => {
    if (window.scrollY > 60) {
      gsap.to(el, { opacity:0, y:8, duration:.35 });
      window.removeEventListener('scroll', hide);
    }
  };
  window.addEventListener('scroll', hide, { passive:true });
}

/* ══════════════════════════════════════════════════
   12. SECTION BACKGROUND PARALLAX (subtle depth)
══════════════════════════════════════════════════ */
function initSectionParallax() {
  ['#s-cal','#s-time','#s-close'].forEach(sel => {
    gsap.to(sel, {
      backgroundPositionY: '40%',
      ease: 'none',
      scrollTrigger: {
        trigger: sel,
        start: 'top bottom', end: 'bottom top',
        scrub: 1.5
      }
    });
  });
}

/* ══════════════════════════════════════════════════
   13. NAMES: LETTER WAVE ON LOAD COMPLETE
══════════════════════════════════════════════════ */
function initNamesWave() {
  // Wrap each Russian letter in .names-wrap into a span for individual animation
  ['#name-groom','#name-bride'].forEach(sel => {
    const el = $(sel);
    if (!el) return;
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach((ch, i) => {
      const sp = document.createElement('span');
      sp.textContent = ch;
      sp.style.display = 'inline-block';
      sp.style.willChange = 'transform';
      el.appendChild(sp);
    });

    // Continuous gentle wave
    gsap.to(`${sel} span`, {
      y: -6,
      duration: .7,
      stagger: { each: .08, repeat: -1, yoyo: true },
      ease: 'sine.inOut',
      delay: 3
    });
  });
}

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  // Block: run preloader, then trigger hero
  await runPreloader();
  initHero();

  // Independent inits
  initCountdown();
  initParallax();
  initScrollAnimations();
  initMagneticNames();
  initCalHover();
  initScrollCue();
  initSectionParallax();
  initNamesWave();
});
