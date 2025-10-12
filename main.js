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
      description: "This site you're on now!",
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

  // layout/typography for title chip
  const CARD_INSET = 0.35;
  const TITLE_MAX_LINES = 3;
  const TITLE_BASE_PX = 36;
  const TITLE_MIN_PX  = 20;
  const TITLE_LINE_PX = 42;

function paletteFor(theme){
  if (theme === 'cream') {
    return {
      // title chip
      titleFg: '#1F1A17',
      titleBgA: '#FFFFFF',
      titleBgB: '#F6F7FB',
      titleStroke: '#D7DBE7',
      // tech pills
      pillFg:  '#1F1A17',
      pillBgA: '#EFF3FF',
      pillBgB: '#E8ECFA',
      pillStroke: '#D7DBE7'
    };
  }
  // sandstone
  return {
    // title chip
    titleFg: '#EDE7E1',
    titleBgA: '#1A1713',
    titleBgB: '#231F1A',
    titleStroke: '#3A322B',
    // tech pills
    pillFg:  '#EDE7E1',
    pillBgA: '#2A241E',
    pillBgB: '#241E19',
    pillStroke: '#3A322B'
  };
}



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
  // Canvas texture helpers
  // ------------------------------
  // Sharp, wrapped title chip with gradient, border, subtle elevation
  function makeWrappedTextTexture(renderer, text, opts = {}) {
    const {
      fontFamily = 'Segoe UI, system-ui, sans-serif',
      fontWeight = '600',
      basePx = TITLE_BASE_PX,
      minPx  = TITLE_MIN_PX,
      lineHeightPx = TITLE_LINE_PX,
      paddingX = 18,
      paddingY = 10,
      fg = '#0b0b18',
      bgA = '#ffffff',
      bgB = '#f6f7fb',        // soft vertical gradient
      stroke = '#D7DBE7',
      radius = 14,
      maxWidthPx,             // required
      maxLines = TITLE_MAX_LINES,
      ellipsis = true
    } = opts;

    if (!maxWidthPx) throw new Error('makeWrappedTextTexture: maxWidthPx is required');

    for (let fontPx = basePx; fontPx >= minPx; fontPx--) {
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      ctx.font = `${fontWeight} ${fontPx}px ${fontFamily}`;
      const words = (text || '').trim().split(/\s+/);
      const lines = [];
      let cur = '';

      for (let i = 0; i < words.length; i++) {
        const tryLine = cur ? cur + ' ' + words[i] : words[i];
        const w = ctx.measureText(tryLine).width;
        if (w <= maxWidthPx) {
          cur = tryLine;
        } else {
          if (cur) lines.push(cur);
          cur = words[i];

          if (lines.length === maxLines - 1) {
            let last = cur + ' ' + words.slice(i + 1).join(' ');
            while (ctx.measureText(last + (ellipsis ? '' : '')).width > maxWidthPx && last.length > 0) {
              last = last.slice(0, -1);
            }
            lines.push(last + (ellipsis ? '' : ''));
            cur = '';
            break;
          }
        }
      }
      if (cur) lines.push(cur);
      if (lines.length > maxLines) continue;

      const textW = Math.min(maxWidthPx, Math.max(...lines.map(l => ctx.measureText(l).width), 0));
      const contentW = Math.ceil(textW);
      const contentH = Math.ceil(lines.length * lineHeightPx);
      const totalW = Math.ceil(contentW + paddingX * 2);
      const totalH = Math.ceil(contentH + paddingY * 2);

      c.width = totalW * dpr;
      c.height = totalH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // rounded rect with gradient + border + light shadow
      const r = radius, w = totalW, h = totalH;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, bgA);
      grad.addColorStop(1, bgB);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.arcTo(w, 0, w, h, r);
      ctx.arcTo(w, h, 0, h, r);
      ctx.arcTo(0, h, 0, 0, r);
      ctx.arcTo(0, 0, w, 0, r);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      // text
      ctx.font = `${fontWeight} ${fontPx}px ${fontFamily}`;
      ctx.fillStyle = fg;
      ctx.textBaseline = 'top';
      let y = paddingY + (lineHeightPx - fontPx) / 2;
      for (const line of lines) {
        ctx.fillText(line, paddingX, y);
        y += lineHeightPx;
      }

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy?.() || 1;
      tex.needsUpdate = true;
      return { texture: tex, widthPx: totalW, heightPx: totalH, fontPx, lines };
    }

    // fallback (unlikely)
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fontPx = TITLE_MIN_PX;
    ctx.font = `${fontPx}px ${fontFamily}`;
    const truncated = (text || '').slice(0, 40) + '…';
    const textW = Math.min(maxWidthPx, ctx.measureText(truncated).width);
    const totalW = Math.ceil(textW + paddingX * 2);
    const totalH = Math.ceil(lineHeightPx + paddingY * 2);
    c.width = totalW * dpr; c.height = totalH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,totalW,totalH);
    ctx.fillStyle = fg; ctx.fillText(truncated, paddingX, paddingY + (lineHeightPx - fontPx) / 2);
    const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true;
    return { texture: tex, widthPx: totalW, heightPx: totalH, fontPx, lines: [truncated] };
  }

  // Tech tag pill (cleaner bg + border)
  function makePillTexture(renderer, text, opts = {}) {
    const {
      paddingX = 14, paddingY = 6,
      font = '500 34px Segoe UI, system-ui, sans-serif',
      fg = '#0b0b18', bgA = '#EFF3FF', bgB = '#E8ECFA', stroke = '#D7DBE7',
      radius = 12, maxWidth = 1024
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

    const r = radius, w = totalW, h = totalH;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, bgA);
    grad.addColorStop(1, bgB);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(w, 0, w, h, r);
    ctx.arcTo(w, h, 0, h, r);
    ctx.arcTo(0, h, 0, 0, r);
    ctx.arcTo(0, 0, w, 0, r);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = font;
    ctx.fillStyle = fg;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, paddingX, h / 2);

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy?.() || 1;
    tex.needsUpdate = true;
    return tex;
  }

  // simple soft highlight overlay texture for the card face
  function makeHighlightTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0.0, 'rgba(255,255,255,0.18)');
    g.addColorStop(0.15,'rgba(255,255,255,0.10)');
    g.addColorStop(0.50,'rgba(255,255,255,0.05)');
    g.addColorStop(1.0, 'rgba(255,255,255,0.00)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
    const tex = new THREE.CanvasTexture(c);
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
        tex.magFilter = THREE.LinearFilter;
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

    // Scene / Camera / Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f1e);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 9.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: usingExternalCanvas,
      canvas: usingExternalCanvas ? container : undefined
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    if (!usingExternalCanvas) container.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';

    // Lights
    const amb = new THREE.AmbientLight(0xffffff, 0.6); scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(5, 5, 5); scene.add(dir);
    const point = new THREE.PointLight(0x667eea, 0.5); point.position.set(-5, 0, 5); scene.add(point);

    // Shared materials
    const cardMaterial = new THREE.MeshStandardMaterial({
      color: 0x232b2b,
      metalness: 0.35,
      roughness: 0.38,
      emissive: 0xffffff,
      emissiveIntensity: 0.12
    });
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.42 });

    // theme hook
    function applyThemeToThree(theme) {
      if (theme === "cream") {
        scene.background = new THREE.Color(0xF5F2EE);
        amb.intensity = 0.45;
        dir.color.set(0xffffff); dir.intensity = 0.7;
        point.color.set(0x8C5E3C); point.intensity = 0.45;

        cardMaterial.color.set(0xF0ECE7);
        cardMaterial.emissiveIntensity = 0.10;
        edgeMaterial.color.set(0x1F1A17); edgeMaterial.opacity = 0.24;
      } else {
        scene.background = new THREE.Color(0x0F0D0A);
        amb.intensity = 0.6;
        dir.color.set(0xffffff); dir.intensity = 0.8;
        point.color.set(0xC9A875); point.intensity = 0.6;

        cardMaterial.color.set(0x1A1713);
        cardMaterial.emissiveIntensity = 0.14;
        edgeMaterial.color.set(0xffffff); edgeMaterial.opacity = 0.35;
      }
    }
    (function syncTheme() {
      const theme = document.documentElement.getAttribute("data-theme") || "sandstone";
      applyThemeToThree(theme);
    })();
    document.addEventListener("themechange", e => applyThemeToThree(e.detail.theme));


    let currentTheme = document.documentElement.getAttribute('data-theme') || 'sandstone';
    let pal = paletteFor(currentTheme);

    // keep this in sync if the user toggles theme (optional live update)
    document.addEventListener('themechange', e => {
      currentTheme = e.detail.theme;
      pal = paletteFor(currentTheme);
      // (rebuilding labels live is optional; see note below)
    });




    // --- Cards ---
    const cards = [];
    async function makeCard(project, i) {
      const group = new THREE.Group();

      // Glow plane (behind card; opacity animated on hover)
      const glowGeo = new THREE.PlaneGeometry(CARD.WIDTH * 1.08, CARD.HEIGHT * 1.12);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xC9A875, transparent: true, opacity: 0.0 });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.z = CARD.GLOW_Z;
      group.add(glow);

      // Card body
      const cardGeo = new THREE.BoxGeometry(CARD.WIDTH, CARD.HEIGHT, CARD.DEPTH);
      const cardMesh = new THREE.Mesh(cardGeo, cardMaterial);
      group.add(cardMesh);

      // Edges
      group.add(new THREE.LineSegments(new THREE.EdgesGeometry(cardGeo), edgeMaterial));

      // Soft face overlay (top highlight)
      {
        const overlayTex = makeHighlightTexture();
        const overlayGeo = new THREE.PlaneGeometry(CARD.WIDTH - 0.02, CARD.HEIGHT - 0.02);
        const overlayMat = new THREE.MeshBasicMaterial({
          map: overlayTex,
          transparent: true,
          depthWrite: false,   // <-- important
          depthTest: true
        });
        const overlay = new THREE.Mesh(overlayGeo, overlayMat);
        overlay.position.z = CARD.OVERLAY_Z - 0.002; // <-- put *behind* labels/pills
        overlay.renderOrder = 1;                     // render first among transparent things
        group.add(overlay);
      }

      // Thumbnail — auto-fit + soft frame and shadow
      try {
        const thumbTex = await loadImageTexture(project.image, renderer);
        const imgW = thumbTex.image.width, imgH = thumbTex.image.height, aspect = imgW / imgH;

        const contentWWorld = CARD.WIDTH - CARD_INSET * 2;
        const maxThumbHWorld = 2.6;
        let thumbW = contentWWorld, thumbH = thumbW / aspect;
        if (thumbH > maxThumbHWorld) { thumbH = maxThumbHWorld; thumbW = thumbH * aspect; }

        // drop shadow plate (dark, blurred look via slight scale and opacity)
        const shadowGeo = new THREE.PlaneGeometry(thumbW * 1.06, thumbH * 1.08);
        const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 });
        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.position.set(0, 2.02, CARD.SHADOW_Z);
        group.add(shadow);

        // image
        const thumbGeo = new THREE.PlaneGeometry(thumbW, thumbH);
        const thumbMat = new THREE.MeshBasicMaterial({
          map: thumbTex,
          transparent: true,
          depthTest: true,
          depthWrite: false,
          polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: 1
        });
        const thumb = new THREE.Mesh(thumbGeo, thumbMat);
        thumb.position.set(0, 2.0, CARD.OVERLAY_Z);
        thumb.renderOrder = 3; 
        group.add(thumb);

        // subtle border/frame
        const frameGeo = new THREE.PlaneGeometry(thumbW + 0.075, thumbH + 0.075);
        const frameMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.set(0, 2.0, CARD.OVERLAY_Z - 0.0005);
        group.add(frame);
      } catch {}

      // Title chip (wrapped)
      {
        const pxToWorld = 0.008;
        const contentWWorld = CARD.WIDTH - CARD_INSET * 2;
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
          fg: pal.titleFg,        // <--
          bgA: pal.titleBgA,   // <-- was bg:
          bgB: pal.titleBgB,
          stroke: pal.titleStroke,
          radius: 14,
          maxLines: TITLE_MAX_LINES,
          ellipsis: false
        });

        const w = widthPx * pxToWorld, h = heightPx * pxToWorld;
        const tgeo = new THREE.PlaneGeometry(w, h);
        const tmat = new THREE.MeshBasicMaterial({
          map: ttex, transparent: true, depthTest: true, depthWrite: false,
          polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: 1
        });
        const tlab = new THREE.Mesh(tgeo, tmat);
        tlab.position.set(0, -0.45, CARD.OVERLAY_Z);
        tlab.renderOrder = 3;
        group.add(tlab);
      }

      // Tech badges (pills)
      {
        const badges = project.tech.slice(0, 6);
        const gap = 0.08;
        const scale = 0.005;

        const meshes = badges.map(txt => {
          const tex = makePillTexture(renderer, txt, {
              font: '500 34px Segoe UI, system-ui, sans-serif',
              fg: pal.pillFg,
              bgA: pal.pillBgA,
              bgB: pal.pillBgB,
              stroke: pal.pillStroke,
              paddingX: 14,
              paddingY: 6,
              radius: 12
            });
          const w = tex.image.width * scale, h = tex.image.height * scale;
          const geo = new THREE.PlaneGeometry(w, h);
          const mat = new THREE.MeshBasicMaterial({
            map: tex, transparent: true, depthTest: true, depthWrite: false,
            polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: 1
          });
          return { mesh: new THREE.Mesh(geo, mat), w };
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
            mesh.renderOrder = 3;
            x += w + gap;
            group.add(mesh);
          });
        });
      }

      // position + store
      group.position.x = (i - 1) * CARD.SPACING;
      group.userData = { originalY: 0, targetY: 0, index: i, glowMat };
      group.userData.glowMat = glowMat; // so we can animate glow on hover
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
      const titleEl = document.getElementById('active-title');
      const descEl  = document.getElementById('active-desc');
      const techEl  = document.getElementById('active-tech');
      if (titleEl) titleEl.textContent = p.title;
      if (descEl)  descEl.textContent  = p.description;
      if (techEl) {
        techEl.innerHTML = '';
        p.tech.forEach(t => {
          const span = document.createElement('span');
          span.className = 'chip';
          span.textContent = t;
          techEl.appendChild(span);
        });
      }
    }

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const toCardGroup = (obj) => { while (obj && obj.parent && obj.parent !== scene) obj = obj.parent; return obj; };

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
          if (hovered.userData.glowMat) hovered.userData.glowMat.opacity = 0.0;
          renderer.domElement.style.cursor = 'default';
        }
        hovered = newHover;
        if (hovered) {
          hovered.userData.targetY = hovered.userData.originalY + CARD.HOVER_LIFT;
          hovered.scale.set(1.03, 1.03, 1.03);
          if (hovered.userData.glowMat) hovered.userData.glowMat.opacity = 0.20;
          renderer.domElement.style.cursor = 'pointer';
        }
      }
    });

    renderer.domElement.addEventListener('mouseleave', () => {
      if (hovered) {
        hovered.userData.targetY = hovered.userData.originalY;
        hovered.scale.set(1, 1, 1);
        if (hovered.userData.glowMat) hovered.userData.glowMat.opacity = 0.0;
        hovered = null;
        renderer.domElement.style.cursor = 'default';
      }
    });

    // Click / drag
    let dragging = false, startX = 0, deltaX = 0, didDrag = false;

    renderer.domElement.addEventListener('pointerdown', (e) => {
      dragging = true; didDrag = false; startX = e.clientX; deltaX = 0;
      renderer.domElement.setPointerCapture(e.pointerId);
    });
    renderer.domElement.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      deltaX = e.clientX - startX;
      if (Math.abs(deltaX) > 3) didDrag = true;
      const offsetCards = deltaX / (CARD.SPACING * 40);
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
          const w = window.open(link, '_blank', 'noopener'); if (w) w.opener = null;
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
    const mod = (n, m) => ((n % m) + m) % m;
    const next = () => snapTo(mod(activeIndex + 1, cards.length));
    const prev = () => snapTo(mod(activeIndex - 1, cards.length));
    function snapTo(idx) { activeIndex = idx; updateActiveInfo(); }

    // Buttons
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
        const ty = card.userData.targetY ?? 0;
        card.position.y += (ty - card.position.y) * 0.12;
      });
      renderer.render(scene, camera);
    }
    animate();
    onResize();
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

    // quick preload log (helps catch path issues locally)
    // ['images/linkedIn.png','images/website.png','images/plane.png','images/stock.png','images/mouse.png','images/hand.png']
    //   .forEach(src => { const img = new Image(); img.onload = () => console.log('OK', src); img.onerror = () => console.error('IMG 404', src); img.src = src; });

    startProjects3D();

    const nav = document.querySelector('.site-nav');
    const onScroll = () => { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  });

  // ------------------------------
  // Public: Resume download
  // ------------------------------
  window.downloadResume = function downloadResume() {
    window.open('DerrickLouis.pdf', '_blank', 'noopener');
  };
})();
