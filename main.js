// ==============================
// Typing + 3D Projects + Theming
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
      title: 'LinkedIn Social Feed Addition',
      description: 'Built during LinkedIn’s inaugural hackathon, this project introduced a new email collection block for post creators—streamlining professional inquiries and eliminating spam from the comment section. Developed using Python, Django, HTML, and CSS.',
      image: 'images/linkedIn.png',
      tech: ['Python', 'Django', 'HTML', 'CSS'],
      link: '#'
    },
    {
      title: 'Portfolio Website',
      description: 'This site you\'re on now!',
      image: 'images/website.png',
      tech: ['HTML','JavaScript', 'Three.js', 'CSS'],
      link: '#'
    },
    {
      title: 'Collaboarative Tavel Management System',
      description: 'An Android app that enables users to plan and share trip itineraries in real-time, integrating Firebase for synced data and Java MVVM architecture for scalable design. Features collaborative editing, dynamic forms, and persistent session data.',
      image: 'images/plane.png',
      tech: ['Java', 'XML', 'Android Studio', 'Firebase'],
      link: '#'
    },
    {
      title: 'AI Stock Prediction Model',
      description: 'Developed an LSTM neural network that predicts stock closing prices using real-time data from the Alpha Vantage API. Includes a Streamlit dashboard for users to visualize trends and test model predictions interactively.',
      image: 'images/stock.png',
      tech: ['Python', 'Keras', 'TensorFlow', 'StreamLit'],
      link: '#'
    },
    {
      title: 'Competitive AI Mouse Maze (WIP)',
      description: 'An interactive simulation where two AI-controlled mice race through a maze using different search algorithms. Users can select each mouse’s strategy and use the sabotage feature to block paths—demonstrating algorithmic efficiency and adaptability.',
      image: 'images/mouse.png',
      tech: ['JavaScript', 'Python', 'React', 'HTML', 'CSS'],
      link: '#'
    },
    {
      title: 'ASL AI Translator (WIP)',
      description: 'A computer-vision tool that recognizes American Sign Language gestures via webcam and converts them into text (and eventually speech). Built with OpenCV, MediaPipe, and TensorFlow, aiming to bridge accessibility through real-time translation.',
      image: 'images/hand.png',
      tech: ['Python', 'OpenCV', 'MediaPipe', 'TensorFlow', 'Keras'],
      link: '#'
    }
  ];

const CARD_INSET = 0.35;        // safe padding inside the card (world units)
const TITLE_MAX_LINES = 2;      // wrap to at most 2 lines
const TITLE_BASE_PX = 36;       // starting font size (canvas px)
const TITLE_MIN_PX  = 20;       // smallest acceptable font size
const TITLE_LINE_PX = 42;       // line height for title (canvas px)


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
  function makeWrappedTextTexture(renderer, text, opts = {}) {
  const {
    fontFamily = 'Segoe UI, system-ui, sans-serif',
    fontWeight = '600',
    basePx = TITLE_BASE_PX,
    minPx  = TITLE_MIN_PX,
    lineHeightPx = TITLE_LINE_PX,
    paddingX = 18,
    paddingY = 8,
    fg = '#0b0b18',
    bg = '#ffffff',
    radius = 14,
    maxWidthPx,          // REQUIRED: max content width in px
    maxLines = TITLE_MAX_LINES,
    ellipsis = true
  } = opts;

  if (!maxWidthPx) throw new Error('makeWrappedTextTexture: maxWidthPx is required');

  // Try decreasing font size until it fits within maxWidthPx & lines
  for (let fontPx = basePx; fontPx >= minPx; fontPx--) {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    ctx.font = `${fontWeight} ${fontPx}px ${fontFamily}`;
    const words = (text || '').trim().split(/\s+/);
    const lines = [];
    let current = '';

    for (let i = 0; i < words.length; i++) {
      const tryLine = current ? current + ' ' + words[i] : words[i];
      const w = ctx.measureText(tryLine).width;
      if (w <= maxWidthPx) {
        current = tryLine;
      } else {
        // push current and start new line
        if (current) lines.push(current);
        current = words[i];

        if (lines.length === maxLines - 1) {
          // last line—fit remainder with optional ellipsis
          let last = current + ' ' + words.slice(i + 1).join(' ');
          // trim until fits
          while (ctx.measureText(last + (ellipsis ? ' ' : '')).width > maxWidthPx && last.length > 0) {
            last = last.slice(0, -1);
          }
          lines.push(last + (ellipsis ? ' ' : ''));
          current = '';
          break;
        }
      }
    }
    if (current) lines.push(current);

    if (lines.length <= maxLines) {
      // Build canvas at this font size
      const textWidth = Math.min(
        maxWidthPx,
        Math.max(...lines.map(line => ctx.measureText(line).width), 0)
      );
      const contentW = Math.ceil(textWidth);
      const contentH = Math.ceil(lines.length * lineHeightPx);

      const totalW = Math.ceil(contentW + paddingX * 2);
      const totalH = Math.ceil(contentH + paddingY * 2);

      c.width = totalW * dpr;
      c.height = totalH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // bg rounded rect
      ctx.fillStyle = bg;
      const r = radius;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.arcTo(totalW, 0, totalW, totalH, r);
      ctx.arcTo(totalW, totalH, 0, totalH, r);
      ctx.arcTo(0, totalH, 0, 0, r);
      ctx.arcTo(0, 0, totalW, 0, r);
      ctx.closePath();
      ctx.fill();

      // text
      ctx.font = `${fontWeight} ${fontPx}px ${fontFamily}`;
      ctx.fillStyle = fg;
      ctx.textBaseline = 'top';
      let y = paddingY + (lineHeightPx - fontPx) / 2; // vertical centering within line box
      for (const line of lines) {
        ctx.fillText(line, paddingX, y);
        y += lineHeightPx;
      }

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy?.() || 1;
      tex.needsUpdate = true;
      return { texture: tex, widthPx: totalW, heightPx: totalH, fontPx, lines };
    }
  }

  // Fallback: single line clipped
  const fallback = document.createElement('canvas');
  const fctx = fallback.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const fontPx = TITLE_MIN_PX;
  fctx.font = `${fontWeight} ${fontPx}px ${fontFamily}`;
  const truncated = (text || '').slice(0, 40);
  const textW = Math.min(maxWidthPx, fctx.measureText(truncated).width);
  const totalW = Math.ceil(textW + paddingX * 2);
  const totalH = Math.ceil(lineHeightPx + paddingY * 2);
  fallback.width = totalW * dpr; fallback.height = totalH * dpr;
  fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  fctx.fillStyle = bg;
  fctx.fillRect(0, 0, totalW, totalH);
  fctx.fillStyle = fg;
  fctx.fillText(truncated, paddingX, paddingY + (lineHeightPx - fontPx) / 2);

  const tex = new THREE.CanvasTexture(fallback);
  tex.needsUpdate = true;
  return { texture: tex, widthPx: totalW, heightPx: totalH, fontPx, lines: [truncated] };
}

// Simple pill text texture for tech badges
function makeTextTexture(renderer, text, opts = {}) {
  const {
    paddingX = 14, paddingY = 6,
    font = '500 34px Segoe UI, system-ui, sans-serif',
    fg = '#0b0b18', bg = '#e9ecff', radius = 12,
    maxWidth = 1024
  } = opts;

  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.font = font;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const textW = Math.min(ctx.measureText(text).width, maxWidth);
  const totalW = Math.ceil(textW + paddingX * 2);
  const totalH = Math.ceil(48 + paddingY * 2);

  c.width = totalW * dpr; c.height = totalH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // rounded rect
  ctx.fillStyle = bg;
  const r = radius, w = totalW, h = totalH;
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
  // Projects 3D Carousel
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
      const theme = document.documentElement.getAttribute("data-theme") || "sandstone";
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

      // Thumbnail (image plane) — auto-fit within safe content rect
    try {
      const thumbTex = await loadImageTexture(project.image, renderer);
      const imgW = thumbTex.image.width;
      const imgH = thumbTex.image.height;
      const aspect = imgW / imgH;

      // safe content rect inside the card
      const contentWWorld = CARD.WIDTH - CARD_INSET * 2;
      const maxThumbHWorld = 2.6; // adjust for your layout (height budget near top)
      let thumbW = contentWWorld;
      let thumbH = thumbW / aspect;

      // if height too tall, scale down
      if (thumbH > maxThumbHWorld) {
        thumbH = maxThumbHWorld;
        thumbW = thumbH * aspect;
      }

      const thumbGeo = new THREE.PlaneGeometry(thumbW, thumbH);
      const thumbMat = new THREE.MeshBasicMaterial({
        map: thumbTex, transparent: true, depthTest: true, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: 1
      });
      const thumbMesh = new THREE.Mesh(thumbGeo, thumbMat);

      // keep near top; ensure it doesn't hit the edges visually
      thumbMesh.position.set(0, 2.0, CARD.OVERLAY_Z);
      group.add(thumbMesh);
    } catch (e) {
      /* ignore image failures */
    }


      // On-card title label
      // Title label (wrapped, responsive)
      {
        // same scale you used before to convert canvas px to world units
        const pxToWorld = 0.008;

        // compute safe content width inside the card (world units)
        const contentWWorld = CARD.WIDTH - CARD_INSET * 2;

        // translate to canvas px
        const maxWidthPx = Math.floor(contentWWorld / pxToWorld);

        const { texture: ttex, widthPx, heightPx } = makeWrappedTextTexture(renderer, project.title, {
          maxWidthPx,
          basePx: TITLE_BASE_PX,
          minPx: TITLE_MIN_PX,
          lineHeightPx: TITLE_LINE_PX,
          paddingX: 18,
          paddingY: 10,
          fontFamily: 'Segoe UI, system-ui, sans-serif',
          fontWeight: '600',
          fg: '#0b0b18',
          bg: '#ffffff',
          radius: 14,
          maxLines: TITLE_MAX_LINES,
          ellipsis: true
        });

        const w = widthPx * pxToWorld;
        const h = heightPx * pxToWorld;
        const tgeo = new THREE.PlaneGeometry(w, h);
        const tmat = new THREE.MeshBasicMaterial({
          map: ttex, transparent: true, depthTest: true, depthWrite: false,
          polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: 1
        });
        const tlab = new THREE.Mesh(tgeo, tmat);

        // Place below the image region; tweak Y as needed
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
    const theme = document.documentElement.getAttribute('data-theme') || 'sandstone';
    btn.setAttribute('aria-pressed', theme === 'sandstone' ? 'true' : 'false');
    btn.setAttribute('aria-label', theme === 'sandstone' ? 'Switch to light theme' : 'Switch to dark theme');
})();

  // ------------------------------
  // Init
  // ------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    startTyping();     // no-op if #typingText absent

    ['images/linkedIn.png','images/website.png','images/plane.png','images/stock.png','images/mouse.png','images/hand.png']
    .forEach(src => {
      const img = new Image();
      img.onload  = () => console.log('OK', src, img.width + 'x' + img.height);
      img.onerror = () => console.error('IMG 404/blocked', src);
      img.src = src;
    });

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
