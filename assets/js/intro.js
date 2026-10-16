// Load-in intro: tap to enter, parts warp in from space, spin, snap together, the key clicks with a bounce,
// the camera settles on the 1K legend, and the name flashes across the top. Plays once per visit.
(function () {
  // ---------- sound (synthesized; needs a tap first on iPhone) ----------
  let ac = null;
  const audio = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; } return ac; };
  function noise(t, dur, freq, q, gain) {
    const a = audio(); if (!a) return;
    const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    const src = a.createBufferSource(); src.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = a.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(a.destination); src.start(a.currentTime + t);
  }
  function tone(t, f0, f1, dur, gain) {
    const a = audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), s = a.currentTime + t;
    o.frequency.setValueAtTime(f0, s); o.frequency.exponentialRampToValueAtTime(f1, s + dur);
    g.gain.setValueAtTime(gain, s); g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    o.connect(g); g.connect(a.destination); o.start(s); o.stop(s + dur + 0.02);
  }
  const sfx = {
    whoosh() { const a = audio(); if (!a) return; const dur = 0.9, buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / d.length) * 0.5;
      const src = a.createBufferSource(); src.buffer = buf; const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
      f.frequency.setValueAtTime(300, a.currentTime); f.frequency.exponentialRampToValueAtTime(2400, a.currentTime + dur);
      const g = a.createGain(); g.gain.value = 0.12; src.connect(f); f.connect(g); g.connect(a.destination); src.start(); },
    snap() { noise(0, 0.05, 1400, 1.2, 0.5); tone(0, 140, 70, 0.09, 0.35); },
    click() { noise(0, 0.018, 3800, 2.5, 0.9); tone(0, 950, 600, 0.03, 0.12); tone(0.004, 190, 85, 0.08, 0.4); noise(0.09, 0.012, 3200, 2.5, 0.35); },
  };
  window.OneKeySfx = sfx;
  const KEY = 'onekey-intro-played';
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const force = /[#&?]intro\b/.test(location.href);
  let played = false; try { played = sessionStorage.getItem(KEY) === '1'; } catch (e) { /* none */ }
  if ((played || reduce) && !force) return;
  // ---------- overlay ----------
  const ov = document.createElement('div'); ov.className = 'intro'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Intro');
  const canvas = document.createElement('canvas'); canvas.className = 'intro-canvas';
  // loading screen: the parent brand in the background, a real progress bar in front
  const load = document.createElement('div'); load.className = 'intro-load';
  const brand = document.createElement('div'); brand.className = 'intro-brand'; brand.setAttribute('aria-hidden', 'true');
  brand.innerHTML = '<span>Key</span><span>Bored</span>';
  const bar = document.createElement('div'); bar.className = 'intro-bar'; bar.setAttribute('role', 'progressbar'); bar.setAttribute('aria-label', 'Loading');
  bar.setAttribute('aria-valuemin', '0'); bar.setAttribute('aria-valuemax', '100');
  const fill = document.createElement('span'); fill.className = 'intro-fill'; bar.append(fill);
  const pct = document.createElement('span'); pct.className = 'intro-pct'; pct.textContent = '0%';
  load.append(brand, bar, pct);
  let shown = 0, target = 0;
  const progress = (p) => { target = Math.max(target, Math.min(1, p)); };
  const title = document.createElement('div'); title.className = 'intro-title'; title.textContent = 'OneKey';
  const skip = document.createElement('button'); skip.type = 'button'; skip.className = 'intro-skip'; skip.textContent = 'Skip';
  ov.append(canvas, load, title, skip);
  document.body.append(ov); document.documentElement.classList.add('intro-on');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return finish(); }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(34, 1, 0.5, 4000);
  const studio = window.OneKeyStudio; scene.environment = studio.studioEnvironment(renderer);
  const key = new THREE.DirectionalLight(studio.lin(0xfff0e0), 2.0); key.position.set(-60, 90, 55);
  const rim = new THREE.DirectionalLight(studio.lin(0xffa860), 1.2); rim.position.set(48, 30, -74);
  scene.add(key, rim, new THREE.HemisphereLight(0x8fa3bd, 0x0a0c10, 0.25));
  // warp starfield: streaks that rush past, then settle into drifting stars
  const NS = 700, sp = new Float32Array(NS * 6), seeds = [];
  for (let i = 0; i < NS; i++) seeds.push({ x: (Math.random() - .5) * 900, y: (Math.random() - .5) * 900, z: -Math.random() * 2400 });
  const sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.LineSegments(sgeo, new THREE.LineBasicMaterial({ color: 0xbfd0e6, transparent: true, opacity: .7 }));
  const starRig = new THREE.Group(); starRig.add(stars); scene.add(starRig);
  const root = new THREE.Group(); root.rotation.x = -Math.PI / 2; scene.add(root);
  const groups = {}, press = [];
  let ready = false, started = false, t0 = 0, sounded = {}, done = false, manualT = null, readyAt = 0;
  const loadStart = performance.now();
  function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();
  async function fetchJSON(url) {     // public intro model, streamed for progress
    const r = await fetch(url); const total = Number(r.headers.get('content-length')) || 0;
    if (!r.body || !r.body.getReader) return r.json();
    const reader = r.body.getReader(), parts = []; let got = 0;
    for (;;) { const { done, value } = await reader.read(); if (done) break; parts.push(value); got += value.length; if (total) progress(0.1 + 0.75 * got / total); }
    const all = new Uint8Array(got); let o = 0; for (const p of parts) { all.set(p, o); o += p.length; }
    return JSON.parse(new TextDecoder().decode(all));
  }
  async function loadModel() {
    progress(0.1);
    return fetchJSON('/assets/intro/intro.json');
  }
  loadModel().then((model) => {
    const MAT = studio.MATS();
    model.parts.forEach((p) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(studio.decode(p.pos, Float32Array), 3));
      g.setIndex(new THREE.BufferAttribute(studio.decode(p.idx, Uint32Array), 1)); g.computeVertexNormals(); g.computeBoundingBox();
      const m = new THREE.Mesh(g, MAT[p.mat] || MAT.default);
      if (!groups[p.group]) {
        const G = new THREE.Group(); root.add(G);
        const dir = new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize();
        groups[p.group] = { G, explode: p.explode, box: new THREE.Box3(), from: dir.multiplyScalar(260 + Math.random() * 180),
          spin: new THREE.Vector3((Math.random() - .5) * 9, (Math.random() - .5) * 9, (Math.random() - .5) * 9), delay: Math.random() * 0.22 };
      }
      groups[p.group].G.add(m); groups[p.group].box.union(g.boundingBox);
      if (p.press) press.push(m);
    });
    const all = new THREE.Box3(); Object.values(groups).forEach((g) => all.union(g.box));
    const span = Math.max(...Object.values(groups).map((g) => g.explode)) - Math.min(0, ...Object.values(groups).map((g) => g.explode));
    root.userData.mid = (all.min.z + all.max.z) / 2; root.userData.span = span; root.userData.size = all.getSize(new THREE.Vector3()).length();
    progress(1); readyAt = performance.now();
  }).catch(() => finish());
  const ease = { out: (x) => 1 - Math.pow(1 - x, 4), inOut: (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, in: (x) => x * x * x };
  const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  function frame(now) {
    if (done) return;
    requestAnimationFrame(frame);
    if (!started) {
      shown += (target - shown) * 0.12; if (target >= 1 && shown > 0.995) shown = 1;
      fill.style.transform = `scaleX(${shown})`; pct.textContent = Math.round(shown * 100) + '%'; bar.setAttribute('aria-valuenow', String(Math.round(shown * 100)));
      if (readyAt && shown === 1 && now - loadStart > 1200 && manualT === null) { ready = true; start(); }
    }
    const t = manualT !== null ? manualT : started ? (now - t0) / 1000 : 0;
    root.visible = ready && started;                         // nothing shows until the tap
    // stars: fast warp at the start, calm drift later
    const speed = started ? 40 * (1 - ease.out(seg(t, 0, 1.4))) + 0.6 : 0.6, len = started ? 2 + 120 * (1 - ease.out(seg(t, 0, 1.2))) : 2;
    for (let i = 0; i < NS; i++) {
      const s = seeds[i]; s.z += speed * 16; if (s.z > 200) { s.z = -2400; s.x = (Math.random() - .5) * 900; s.y = (Math.random() - .5) * 900; }
      sp.set([s.x, s.y, s.z, s.x, s.y, s.z - len], i * 6);
    }
    sgeo.attributes.position.needsUpdate = true;
    if (ready && started) {
      const mid = root.userData.mid, size = root.userData.size;
      // A. parts soar in to the exploded layout (0.0-1.0)   C. snap together (1.85-2.2)
      const kx = 1 - ease.in(seg(t, 1.85, 2.2));
      Object.values(groups).forEach((g) => {
        const a = ease.out(seg(t, g.delay, 0.9 + g.delay)), far = 1 - a;
        g.G.position.set(g.from.x * far, g.from.y * far, g.from.z * far + g.explode * kx);
        g.G.rotation.set(g.spin.x * far, g.spin.y * far, g.spin.z * far);
      });
      if (t > 0.05 && !sounded.whoosh) { sounded.whoosh = 1; sfx.whoosh(); }
      if (t > 2.2 && !sounded.snap) { sounded.snap = 1; sfx.snap(); }
      // D. the key clicks (2.4-2.75) with a small bounce of the whole unit
      const pt = t - 2.4; let p = 0;
      if (pt > 0 && pt < 0.07) p = pt / 0.07; else if (pt >= 0.07 && pt < 0.12) p = 1; else if (pt >= 0.12 && pt < 0.35) { const u = (pt - 0.12) / 0.23; p = 1 - u * u * (3 - 2 * u) + 0.06 * Math.sin(u * Math.PI); }
      press.forEach((m) => { m.position.z = -4 * p; });
      if (pt > 0 && !sounded.click) { sounded.click = 1; sfx.click(); }
      const bt = t - 2.4, bounce = bt > 0 && bt < 0.45 ? -0.9 * Math.exp(-bt * 9) * Math.sin(bt * 26) : 0;
      // B. spin while exploded (1.0-1.85), then E. settle onto the 1K legend (2.7-3.5)
      const spin = ease.inOut(seg(t, 0.95, 1.9)) * Math.PI * 2;
      root.rotation.z = spin;
      const settle = ease.inOut(seg(t, 2.65, 3.5));
      const explodedView = Math.max(size * 3.4, root.userData.span * 3.2 + size * 1.6), assembledView = size * 2.6, closeView = size * 1.9;
      const dist = t < 2.2 ? explodedView + (assembledView - explodedView) * ease.in(seg(t, 1.85, 2.2)) : assembledView + (closeView - assembledView) * settle;
      const el = 0.38 + (0.95 - 0.38) * settle, az = -0.72 + 0.72 * settle;
      const ty = (mid + (root.userData.span * 0.5) * kx) + bounce;
      camera.position.set(Math.sin(az) * Math.cos(el) * dist, ty + Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist);
      camera.lookAt(0, ty, 0);
      if (t > 3.2) ov.classList.add('intro-flash');          // F. name flashes across the top
      if (t > 4.3 && manualT === null) finish();              // G. hand off to the page
    } else { camera.position.set(0, 0, 300); camera.lookAt(0, 0, 0); }
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  function start() {
    if (started) return;
    started = true; t0 = performance.now(); ov.classList.add('intro-go');
    if (!ready) { const wait = setInterval(() => { if (ready) { clearInterval(wait); t0 = performance.now(); } }, 50); }
  }
  ov.addEventListener('pointerdown', () => audio(), { once: true });   // iPhone allows sound only after a touch
  skip.addEventListener('click', finish);
  function finish() {
    if (done) return; done = true;
    try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* none */ }
    ov.classList.add('intro-out'); document.documentElement.classList.remove('intro-on');
    setTimeout(() => { ov.remove(); try { renderer && renderer.dispose(); renderer && renderer.forceContextLoss(); } catch (e) { /* none */ } }, 650);
  }
  window.OneKeyIntro = { start() { ready = true; start(); }, finish, at(sec) { manualT = sec; }, loaded: () => !!readyAt };   // at(): test hook to freeze the timeline
})();
