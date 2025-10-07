// ==============================
// Typing + 3D Projects + Theming
// ==============================
(() => {
  // ------------------------------
  // Config
  // ------------------------------
  const TYPING_TEXTS = [
    "Hi, Derrick Louis",
    "An Aspiring Software Engineer",
    "A Curious Problem Solver",
    "An Adaptable Developer",
    "A CS Student at Georgia Tech",
    "Am Building the Future"
  ];
  const TYPING_SPEED = 100;   // ms per char
  const DELETE_SPEED = 50;    // ms per char
  const END_PAUSE    = 2000;  // ms at end of line

  const CARD = {
    WIDTH: 5,
    HEIGHT: 7,
    DEPTH: 0.2,
    SPACING: 6,
    HOVER_LIFT: 1.1,
    OVERLAY_Z: 0.105, // slightly in front of box face (0.1)
  };

  const PROJECTS = [
    {
      title: 'E-Commerce Platform',
      description: 'A full-stack storefront with cart, checkout, and admin analytics. Optimized for Lighthouse performance and accessibility.',
      image: 'https://picsum.photos/seed/shop/800/600',
      tech: ['TypeScript', 'Next.js', 'Node', 'PostgreSQL', 'Stripe'],
      link: '#'
    },
    {
      title: 'Portfolio Website',
      description: 'Design-forward personal site with dynamic sections, MDX blog, and a 3D projects gallery powered by Three.js.',
      image: 'https://picsum.photos/seed/port/800/600',
      tech: ['React', 'Three.js', 'Framer Motion', 'Vercel'],
      link: '#'
    },
    {
      title: 'Mobile App',
      description: 'Cross-platform app for habit tracking, offline sync, and rich push notifications.',
      image: 'https://picsum.photos/seed/mobile/800/600',
      tech: ['React Native', 'Expo', 'Firebase', 'Zustand'],
      link: '#'
    }
  ];

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
  // Canvas Textures Helpers
  // ------------------------------
  function makeTextTexture(renderer, text, opts = {}) {
    const {
      paddingX = 16, paddingY = 10,
      font = '500 36px Segoe UI, system-ui, sans-serif',
      fg = '#0b0b18', bg = '#ffffff', radius = 18,
      maxWidth = 1024
    } = opts;

    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    ctx.font = font;

    let w = Math.ceil(ctx.measureText(text).width + paddingX * 2);
    const h = Math.ceil(48 + paddingY * 2);
    w = Math.min(w, maxWidth);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = h * dpr;
    ctx.scale(dpr, dpr);

    // rounded rect
    ctx.fillStyle = bg;
    const r = radius;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(w, 0, w, h, r);
    ctx.arcTo(w, h, 0, h, r);
    ctx.arcTo(0, h, 0, 0, r);
    ctx.arcTo(0, 0, w, 0, r);
    ctx.closePath();
    ctx.fill();

    // text
    ctx.font = font;
    ctx.fillStyle = fg;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, paddingX, h / 2);

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy?.() || 1;
    tex.needsUpdate = true;
    return tex;
  }

  function loadImageTexture(url, renderer) {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      if (loader.setCrossOrigin) loader.setCrossOrigin('anonymous');
      loader.load(url, tex => {
        tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = renderer?.capabilities?.getMaxAnisotropy?.() || 1;
        tex.minFilter = THREE.LinearFilter;
        resolve(tex);
      }, undefined, reject);
    });
  }

  // ------------------------------
  // Projects 3D Carousel (supports #canvas-container OR #projectsCanvas)
  // ------------------------------
  function startProjects3D(projects = PROJECTS) {
    const container = document.getElementById('canvas-container') || document.getElementById('projectsCanvas');
    if (!container) return;

    const usingExternalCanvas = container.id === 'projectsCanvas';
    const activeTitleEl = document.getElementById('active-title');
    const activeDescEl  = document.getElementById('active-desc');
    const activeTechEl  = document.getElementById('active-tech');

    // Scene / Camera / Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f1e);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 9.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: usingExternalCanvas, // if using an existing <canvas>, keep alpha
      canvas: usingExternalCanvas ? container : undefined
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    if (!usingExternalCanvas) container.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';

    // Lights (keep references for theming)
    const amb = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 5, 5);
    scene.add(dir);
    const point = new THREE.PointLight(0x667eea, 0.5);
    point.position.set(-5, 0, 5);
    scene.add(point);

    // Shared materials (used by all cards; makes theme switching instant)
    const cardMaterial = new THREE.MeshStandardMaterial({
      color: 0x232b2b, metalness: 0.3, roughness: 0.4, emissive: 0xffffff, emissiveIntensity: 0.16
    });
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });

    // Apply theme to scene/lights/materials
    function applyThemeToThree(theme) {
      if (theme === "cream") {
        // Light — Coffee & Cream
        scene.background = new THREE.Color(0xF5F2EE);
        amb.intensity = 0.45;
        dir.color.set(0xffffff); dir.intensity = 0.7;
        point.color.set(0x8C5E3C); point.intensity = 0.45;

        cardMaterial.color.set(0xF0ECE7);
        cardMaterial.emissive.set(0xffffff);
        cardMaterial.emissiveIntensity = 0.10;

        edgeMaterial.color.set(0x1F1A17);
        edgeMaterial.opacity = 0.22;
      } else {
        // Dark — Sandstone
        scene.background = new THREE.Color(0x0F0D0A);
        amb.intensity = 0.6;
        dir.color.set(0xffffff); dir.intensity = 0.8;
        point.color.set(0xC9A875); point.intensity = 0.6;

        cardMaterial.color.set(0x1A1713);
        cardMaterial.emissive.set(0xffffff);
        cardMaterial.emissiveIntensity = 0.14;

        edgeMaterial.color.set(0xffffff);
        edgeMaterial.opacity = 0.35;
      }
    }
    // Sync theme now + on change
    (function syncTheme() {
      const theme = document.documentElement.getAttribute("data-theme") || "cream";
      applyThemeToThree(theme);
    })();
    document.addEventListener("themechange", e => applyThemeToThree(e.detail.theme));

    // --- Cards ---
    const cards = [];
    async function makeCard(project, i) {
      const group = new THREE.Group();

      // Base card (shared materials)
      const cardGeo = new THREE.BoxGeometry(CARD.WIDTH, CARD.HEIGHT, CARD.DEPTH);
      const cardMesh = new THREE.Mesh(cardGeo, cardMaterial);
      group.add(cardMesh);

      // Border edges
      group.add(new THREE.LineSegments(
        new THREE.EdgesGeometry(cardGeo),
        edgeMaterial
      ));

      // Thumbnail
      try {
        const thumbTex = await loadImageTexture(project.image, renderer);
        const aspect = thumbTex.image.width / thumbTex.image.height;
        const thumbW = 3.4;
        const thumbH = thumbW / aspect;
        const thumbGeo = new THREE.PlaneGeometry(thumbW, thumbH);
        const thumbMat = new THREE.MeshBasicMaterial({
          map: thumbTex, transparent: true, depthTest: true, depthWrite: false,
          polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: 1
        });
        const thumbMesh = new THREE.Mesh(thumbGeo, thumbMat);
        thumbMesh.position.set(0, 2.0, CARD.OVERLAY_Z);
        group.add(thumbMesh);
      } catch (e) { /* image load failed: ignore */ }

      // On-card title label
      {
        const ttex = makeTextTexture(renderer, project.title, {
          font: '600 35px Segoe UI, system-ui, sans-serif',
          fg: '#0b0b18', bg: '#ffffff', paddingX: 18, paddingY: 8, radius: 14
        });
        const scale = 0.008;
        const w = ttex.image.width * scale, h = ttex.image.height * scale;
        const tgeo = new THREE.PlaneGeometry(w, h);
        const tmat = new THREE.MeshBasicMaterial({
          map: ttex, transparent: true, depthTest: true, depthWrite: false,
          polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: 1
        });
        const tlab = new THREE.Mesh(tgeo, tmat);
        tlab.position.set(0, -0.45, CARD.OVERLAY_Z);
        group.add(tlab);
      }

      // Tech badges
      {
        const badges = project.tech.slice(0, 6);
        const gap = 0.08;
        const scale = 0.005;

        const meshes = badges.map(txt => {
          const tex = makeTextTexture(renderer, txt, {
            font: '500 34px Segoe UI, system-ui, sans-serif',
            fg: '#0b0b18', bg: '#e9ecff', paddingX: 14, paddingY: 6, radius: 12
          });
          const w = tex.image.width * scale;
          const h = tex.image.height * scale;
          const geo = new THREE.PlaneGeometry(w, h);
          const mat = new THREE.MeshBasicMaterial({
            map: tex, transparent: true, depthTest: true, depthWrite: false,
            polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: 1
          });
          return { mesh: new THREE.Mesh(geo, mat), w, h };
        });

        const maxRowWidth = 5;
        let rows = [[]], rowW = 0;
        for (const b of meshes) {
          const addW = (rowW === 0 ? 0 : gap) + b.w;
          if (rowW + addW > maxRowWidth) { rows.push([b]); rowW = b.w; }
          else { rows[rows.length - 1].push(b); rowW += addW; }
        }

        const startY = -1.5, rowGap = 0.5;
        rows.forEach((row, rIdx) => {
          const totalW = row.reduce((s, b, idx) => s + b.w + (idx ? gap : 0), 0);
          let x = -totalW / 2;
          const y = startY - rIdx * rowGap;
          row.forEach(({ mesh, w }) => {
            mesh.position.set(x + w / 2, y, CARD.OVERLAY_Z);
            x += w + gap;
            group.add(mesh);
          });
        });
      }

      group.position.x = (i - 1) * CARD.SPACING;
      group.userData = { originalY: 0, targetY: 0, index: i };
      scene.add(group);
      cards.push(group);
    }

    (async () => {
      for (let i = 0; i < projects.length; i++) await makeCard(projects[i], i);
      updateActiveInfo();
    })();

    // Carousel state
    let activeIndex = 1;
    let animT = 0;
    let hovered = null;

    function updateActiveInfo() {
      const p = projects[activeIndex];
      if (!p) return;
      const activeTitleEl = document.getElementById('active-title');
      const activeDescEl  = document.getElementById('active-desc');
      const activeTechEl  = document.getElementById('active-tech');
      if (activeTitleEl) activeTitleEl.textContent = p.title;
      if (activeDescEl)  activeDescEl.textContent  = p.description;
      if (activeTechEl) {
        activeTechEl.innerHTML = '';
        p.tech.forEach(t => {
          const span = document.createElement('span');
          span.className = 'chip';
          span.textContent = t;
          activeTechEl.appendChild(span);
        });
      }
    }

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    function toCardGroup(obj) {
      while (obj && obj.parent && obj.parent !== scene) obj = obj.parent;
      return obj;
    }

    renderer.domElement.addEventListener('mousemove', (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(cards, true);

      let newHover = null;
      if (hits.length) {
        const g = toCardGroup(hits[0].object);
        if (cards.includes(g)) newHover = g;
      }

      if (newHover !== hovered) {
        if (hovered) {
          hovered.userData.targetY = hovered.userData.originalY;
          hovered.scale.set(1, 1, 1);
          renderer.domElement.style.cursor = 'default';
        }
        hovered = newHover;
        if (hovered) {
          hovered.userData.targetY = hovered.userData.originalY + CARD.HOVER_LIFT;
          hovered.scale.set(1.03, 1.03, 1.03);
          renderer.domElement.style.cursor = 'pointer';
        }
      }
    });

    renderer.domElement.addEventListener('mouseleave', () => {
      if (hovered) {
        hovered.userData.targetY = hovered.userData.originalY;
        hovered.scale.set(1, 1, 1);
        hovered = null;
        renderer.domElement.style.cursor = 'default';
      }
    });

    // Click / snap / open
    let dragging = false, startX = 0, deltaX = 0, didDrag = false;

    renderer.domElement.addEventListener('pointerdown', (e) => {
      dragging = true; didDrag = false; startX = e.clientX; deltaX = 0;
      renderer.domElement.setPointerCapture(e.pointerId);
    });
    renderer.domElement.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      deltaX = e.clientX - startX;
      if (Math.abs(deltaX) > 3) didDrag = true;
      const offsetCards = deltaX / (CARD.SPACING * 40); // sensitivity scaled to spacing
      cards.forEach((card, i) => {
        const target = (i - activeIndex) * CARD.SPACING + offsetCards;
        card.position.x += (target - card.position.x) * 0.35;
      });
    });
    renderer.domElement.addEventListener('pointerup', () => {
      dragging = false;
      if (Math.abs(deltaX) > 50) { deltaX < 0 ? next() : prev(); }
      else snapTo(activeIndex);
    });

    renderer.domElement.addEventListener('click', () => {
      if (didDrag) return;
      if (!hovered) return;
      const idx = hovered.userData.index;
      if (idx === activeIndex) {
        const link = projects[idx]?.link;
        if (link && link !== '#') {
          const w = window.open(link, '_blank', 'noopener');
          if (w) w.opener = null;
        }
      } else {
        snapTo(idx);
      }
    });

    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });

    // Controls
    function mod(n, m) { return ((n % m) + m) % m; }
    function next() { snapTo(mod(activeIndex + 1, cards.length)); }
    function prev() { snapTo(mod(activeIndex - 1, cards.length)); }
    function snapTo(idx) { activeIndex = idx; updateActiveInfo(); }

    // Buttons (if present)
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    // Resize
    function onResize() {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // Animate
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const yawAmp = reduceMotion ? 0.0 : 0.05;

    function animate() {
      requestAnimationFrame(animate);
      animT += 0.005;
      cards.forEach((card, i) => {
        const targetX = (i - activeIndex) * CARD.SPACING;
        card.position.x += (targetX - card.position.x) * 0.12;
        card.rotation.y = Math.sin(animT * 0.5 + i * 0.5) * yawAmp;
        const ty = card.userData.targetY;
        card.position.y += (ty - card.position.y) * 0.12;
      });
      renderer.render(scene, camera);
    }
    animate();
    onResize();
  }

  // ------------------------------
  // Theme Control (UI + storage + event)
  // ------------------------------
  (function initTheme() {
    const STORAGE_KEY = "site-theme"; // "cream" | "sandstone"
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Default: light cream, but if user prefers dark, start sandstone
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
      });
    }
  })();

  // ------------------------------
  // NAVBar
  // ------------------------------

  // Active link highlighting
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
    const theme = document.documentElement.getAttribute('data-theme') || 'cream';
    btn.setAttribute('aria-pressed', theme === 'sandstone' ? 'true' : 'false');
    btn.setAttribute('aria-label', theme === 'sandstone' ? 'Switch to light theme' : 'Switch to dark theme');
})();

  // ------------------------------
  // Init
  // ------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    startTyping();     // no-op if #typingText absent
    startProjects3D(); // no-op if container absent

    const nav = document.querySelector('.site-nav');
    const onScroll = () => {
        if (!nav) return;
        nav.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  });

  // ------------------------------
  // Public: Resume download
  // ------------------------------
  window.downloadResume = function downloadResume() {
    // Example: window.open('/resume.pdf', '_blank', 'noopener');
    window.open('DerrickLouis.pdf', '_blank', 'noopener');
  };
})();
