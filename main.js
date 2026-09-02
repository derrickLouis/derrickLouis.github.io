// ==============================
// Typing + Theming + Nav
// ==============================
(() => {
  // ------------------------------
  // Config
  // ------------------------------
  const TYPING_TEXTS = [
    "Hi, I'm Derrick Louis",
    "An Aspiring Software Engineer",
    "A Curious Problem Solver",
    "An Adaptable Developer",
    "A CS Student",
    "An Innovator"
  ];
  const TYPING_SPEED = 100;
  const DELETE_SPEED = 50;
  const END_PAUSE    = 2000;

  const CARD = {
    WIDTH: 5,
    HEIGHT: 7,
    DEPTH: 0.2,
    SPACING: 6,
    HOVER_LIFT: 1.1,
    OVERLAY_Z: 0.105,
    GLOW_Z: -0.11,    // glow sits just behind card
    SHADOW_Z: 0.099,  // tiny offset to avoid z-fight
  };

  // ------------------------------
  // Typing Animation
  // ------------------------------
  function startTyping({ targetId = 'typingText', texts = TYPING_TEXTS, speed = TYPING_SPEED, delSpeed = DELETE_SPEED, endPause = END_PAUSE } = {}) {
    const el = document.getElementById(targetId);
    if (!el || !Array.isArray(texts) || texts.length === 0) return;

    let ti = 0, ci = 0, deleting = false;

    function step() {
      const text = texts[ti];
      if (!deleting) {
        el.innerHTML = text.slice(0, ci + 1) + '<span class="typing-cursor">|</span>';
        ci++;
        if (ci === text.length) {
          setTimeout(() => { deleting = true; step(); }, endPause);
          return;
        }
      } else {
        el.innerHTML = text.slice(0, ci - 1) + '<span class="typing-cursor">|</span>';
        ci--;
        if (ci === 0) {
          deleting = false;
          ti = (ti + 1) % texts.length;
        }
      }
      setTimeout(step, deleting ? delSpeed : speed);
    }
    step();
  }

  // ------------------------------
  // Theme Control
  // ------------------------------
  (function initTheme() {
    const STORAGE_KEY = "site-theme"; // "cream" | "sandstone"
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = localStorage.getItem(STORAGE_KEY) || (prefersDark ? "sandstone" : "cream");
    document.documentElement.setAttribute("data-theme", initial);

    const btn = document.getElementById("themeToggle");
    if (btn) {
      btn.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme");
        const next = cur === "cream" ? "sandstone" : "cream";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem(STORAGE_KEY, next);
        document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next }}));
        btn.setAttribute('aria-pressed', next === 'sandstone' ? 'true' : 'false');
        btn.setAttribute('aria-label', next === 'sandstone' ? 'Switch to light theme' : 'Switch to dark theme');
      });
    }
  })();

  // ------------------------------
  // Nav active link highlight
  // ------------------------------
  (function initActiveLinks() {
    const links = Array.from(document.querySelectorAll('.nav-links a'))
      .filter(a => a.hash && document.querySelector(a.hash));
    if (!links.length || !('IntersectionObserver' in window)) return;

    const map = new Map(links.map(a => [a.hash, a]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const a = map.get('#' + entry.target.id);
        if (!a) return;
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          a.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });

    links.forEach(a => observer.observe(document.querySelector(a.hash)));
  })();

  (function setInitialThemeBtn(){
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const theme = document.documentElement.getAttribute('data-theme') || 'sandstone';
    btn.setAttribute('aria-pressed', theme === 'sandstone' ? 'true' : 'false');
    btn.setAttribute('aria-label', theme === 'sandstone' ? 'Switch to light theme' : 'Switch to dark theme');
  })();

  // ------------------------------
  // Init
  // ------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    startTyping();

    const nav = document.querySelector('.site-nav');
    const onScroll = () => { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  });

  // Back to Top
(() => {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const showAfter = window.innerHeight * 0.6;   // show after ~60% of viewport
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || window.pageYOffset;
      if (y > showAfter) btn.classList.add('show');
      else btn.classList.remove('show');
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // set initial state

  btn.addEventListener('click', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
})();

})();
