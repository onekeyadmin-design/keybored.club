// Key Bored product viewer: one product. Tap the keycap to press it; drag to turn; it eases home after 5 s.
(function () {
  function create(host, D, KD, init) {
    const lin = (h) => new THREE.Color(h).convertSRGBToLinear();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05; host.appendChild(renderer.domElement);
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 1, 8000);
    (function env() {
      const e = new THREE.Scene(), g = new THREE.SphereGeometry(400, 48, 24), pa = g.attributes.position, cols = [];
      for (let i = 0; i < pa.count; i++) { const y = pa.getY(i) / 400; const v = y < -0.12 ? 0.3 + 0.2 * (-y) : y < 0.12 ? 0.05 : 0.04 + 0.95 * Math.exp(-Math.pow((y - 0.42) / 0.17, 2)); cols.push(v * 1.03, v, v * 0.95); }
      g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); e.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
      const box = (w, h, c, k, p) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: lin(c).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); e.add(m); };
      box(260, 200, 0xfff1e3, 3.4, [-210, 170, 190]); box(40, 200, 0xffb066, 2.2, [170, 30, -260]); box(30, 320, 0xbfdcff, 2.0, [260, 40, 60]);
      const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(e, 0.03, 0.1, 1000).texture;
    })();
    const key = new THREE.DirectionalLight(lin(0xfff0e0), 1.5); key.position.set(-60, 100, 55);
    const rim = new THREE.DirectionalLight(lin(0x9cc8ff), 1.0); rim.position.set(80, 40, -40);
    scene.add(key, rim, new THREE.HemisphereLight(0x8fa3bd, 0x30343a, 0.2));
    const sp = []; let sd = 3; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    for (let i = 0; i < 2200; i++) { const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, R = 1600 + rnd() * 900; sp.push(R * Math.sqrt(1 - u * u) * Math.cos(th), R * u, R * Math.sqrt(1 - u * u) * Math.sin(th)); }
    const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)), new THREE.PointsMaterial({ color: 0xcfd8ff, size: 2, sizeAttenuation: false, transparent: true, opacity: .8 }));
    scene.add(stars);
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    Object.assign(controls, { enableDamping: true, dampingFactor: .08, enablePan: false, minDistance: 30, maxDistance: 4000, rotateSpeed: .8, autoRotate: false });
    let lastTouch = performance.now(), atHome = true;
    controls.addEventListener('start', () => { lastTouch = performance.now(); atHome = false; glide = null; });
    controls.addEventListener('change', () => { if (controls.__dragging) lastTouch = performance.now(); });
    controls.addEventListener('end', () => { lastTouch = performance.now(); });
    const dec = (b, T) => { const x = atob(b), u = new Uint8Array(x.length); for (let i = 0; i < x.length; i++) u[i] = x.charCodeAt(i); return new T(u.buffer); };
    const decPos = (m) => { const q = dec(m.pos, Uint16Array), o = new Float32Array(q.length), s = m.q; for (let i = 0; i < q.length; i++) { const a = i % 3; o[i] = s[a] + q[i] * s[3 + a]; } return o; };
    const COLORS = window.KB_COLORS;
    const METAL = { brass: [0xe2b65c, .2], stainless: [0xc9cdd2, .28], tungsten: [0x5d6066, .34] };
    const ROLE = { tag: [0x3a6ea5, 0, .6], ferrite: [0x2b2e33, 0, .7], brass: [0xe2b65c, 1, .2], brasssmall: [0xd4a650, 1, .25], stainless: [0xc9cdd2, 1, .28], steel: [0xc4c8cd, 1, .25],
      hsg: [0x2b2e33, 0, .55], hbot: [0x17191c, 0, .6], copper: [0xc8925a, 1, .25], stem: [0x5c6067, 0, .5], cap1k: [0x26282c, 0, .7], leg1k: [0xe6e9ee, 0, .6], capgmk: [0xefe7d4, 0, .38] };
    const CASEABLE = ['solid', 'screw'], METAL_LINE = ['nested', 'stack'];
    const root = new THREE.Group(); root.rotation.x = -Math.PI / 2; scene.add(root);
    const corkTex = (function () {
      const n = 1024, cv = document.createElement('canvas'); cv.width = cv.height = n; const g = cv.getContext('2d');
      g.fillStyle = '#c49a6c'; g.fillRect(0, 0, n, n); let s = 9; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (let i = 0; i < 26000; i++) { const x = r() * n, y = r() * n, z = 0.6 + r() * 2.4, t = r(); g.fillStyle = t < .5 ? `rgba(120,80,45,${.25 + r() * .35})` : `rgba(235,205,160,${.2 + r() * .3})`; g.beginPath(); g.ellipse(x, y, z, z * (0.5 + r()), r() * 3, 0, 7); g.fill(); }
      const px = n / D.mat.w, box = 30 * px; g.strokeStyle = 'rgba(70,45,25,.75)'; g.lineWidth = 3; g.setLineDash([14, 10]); g.strokeRect(n / 2 - box / 2, n / 2 - box / 2, box, box); g.setLineDash([]);
      g.fillStyle = 'rgba(70,45,25,.8)'; g.textAlign = 'center'; g.font = '600 34px system-ui,Arial'; g.fillText('PLACE KEY HERE', n / 2, n / 2 + box / 2 + 54);
      g.font = '700 30px system-ui,Arial'; g.fillText('KEY BORED', n / 2, n - 70); g.font = '500 22px system-ui,Arial'; g.fillText('DESK MAT  ·  1 KEY EDITION', n / 2, n - 38);
      const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
    })();
    const P = [];
    D.parts.forEach((p) => {
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(decPos(p), 3));
      g.setIndex(new THREE.BufferAttribute(dec(p.idx, p.i16 ? Uint16Array : Uint32Array), 1)); g.computeVertexNormals(); g.computeBoundingBox();
      if (p.role === 'cork') { const pa = g.attributes.position, uv = new Float32Array(pa.count * 2), w = D.mat.w; for (let i = 0; i < pa.count; i++) { uv[2 * i] = pa.getX(i) / w + .5; uv[2 * i + 1] = pa.getY(i) / w + .5; } g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); }
      const mesh = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ roughness: .5 })); root.add(mesh); P.push({ mesh, ...p, press: ['stem', 'cap1k', 'leg1k', 'capgmk', 'leggmk'].includes(p.name) });
    });
    const st = Object.assign({ prod: 'solid', color: 'orange', keycap: 'gmk', metal: 'brass', exploded: false, case: false, mat: false, tether: false, space: false }, init || {});
    let k = 0, pressT = -1;
  // ---------- OneKey 75 (monoblock keyboard) ----------
  const KB = (function () {
    const K = KD; if (!K) return null;
    const geo = {}; Object.entries(K.meshes).forEach(([n, m]) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(decPos(m), 3)); g.setIndex(new THREE.BufferAttribute(dec(m.idx, m.i16 ? Uint16Array : Uint32Array), 1)); g.computeVertexNormals(); geo[n] = g; });
    const M = (o) => new THREE.MeshPhysicalMaterial(o);
    const mats = { block: M({ metalness: .85, roughness: .38 }), brass: M({ color: lin(0xe2b65c), metalness: 1, roughness: .25 }), pcb: M({ color: lin(0x1c1f22), roughness: .7 }),
      elec: M({ color: lin(0xb9bec5), metalness: 1, roughness: .3 }), sw: M({ color: lin(0x8f98a3), roughness: .2, transmission: 0, transparent: true, opacity: .55 }), stem: M({ roughness: .4 }),
      alpha: M({ color: lin(0xefe7d4), roughness: .38, envMapIntensity: .25 }), mod: M({ color: lin(0x3a3d42), roughness: .4, envMapIntensity: .25 }), acc: M({ roughness: .4, envMapIntensity: .25 }) };
    const root = new THREE.Group(); root.rotation.x = -Math.PI / 2; scene.add(root);
    const tilt = new THREE.Group(); tilt.rotation.x = THREE.MathUtils.degToRad(K.tilt); root.add(tilt);
    const th = THREE.MathUtils.degToRad(K.tilt); tilt.position.z = -(K.outFront * Math.sin(th) - K.frontH * Math.cos(th)); tilt.position.y = 0;
    const parts = [], keys = [];
    const add = (g, m, ex) => { const o = new THREE.Mesh(g, m); tilt.add(o); parts.push({ o, ex, base: 0 }); return o; };
    add(geo.block, mats.block, 0); add(geo.brass, mats.brass, -38); add(geo.pcb, mats.pcb, -20); add(geo.elec, mats.elec, -20);
    K.keys.forEach((k, i) => {
      const sw = new THREE.Mesh(geo.switch, mats.sw); sw.position.set(k.x, k.y, K.pt); tilt.add(sw); parts.push({ o: sw, ex: 22, base: K.pt });
      const st_ = new THREE.Mesh(geo.stem, mats.stem); st_.position.set(k.x, k.y, K.pt); tilt.add(st_); parts.push({ o: st_, ex: 22, base: K.pt, key: i });
      const cap = new THREE.Mesh(geo['cap' + k.w], mats[k.grp]); cap.position.set(k.x, k.y, K.pt + 6.6); tilt.add(cap); parts.push({ o: cap, ex: 46, base: K.pt + 6.6, key: i });
      if (k.label) {   // legend: a decal sitting in the dish
        const W = k.w * 19.05 - 0.95 - 5.4, D = 14.6, cw = Math.round(W * 14), ch = Math.round(D * 14), cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
        const c2 = cv.getContext('2d'), single = k.label.length === 1;
        c2.fillStyle = k.grp === 'alpha' ? '#26292d' : '#efe7d4'; c2.textBaseline = 'top';
        if (single) { c2.font = `700 ${Math.round(ch * .42)}px system-ui,Arial`; c2.textAlign = 'center'; c2.fillText(k.label, cw / 2, ch * .2); }
        else { c2.font = `600 ${Math.round(ch * .2)}px system-ui,Arial`; c2.textAlign = 'left'; c2.fillText(k.label, cw * .12, ch * .16); }
        const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
        const leg = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
        leg.position.set(k.x, k.y + 0.3, K.pt + 6.6 + 7.03); tilt.add(leg); parts.push({ o: leg, ex: 46, base: K.pt + 6.6 + 7.03, key: i, leg: true });
      }
      keys.push(k);
    });
    return { root, tilt, parts, mats, n: K.keys.length };
  })();

    const shadow = (function () {
      const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d'), gr = g.createRadialGradient(128, 128, 10, 128, 128, 128);
      gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(.55, 'rgba(0,0,0,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false })); root.add(m); return m;
    })();
    const stag = (kk, ex, mx) => { const r = mx ? Math.min(1, Math.abs(ex) / mx) : 0, d = 0.35 * (1 - r); let s = Math.min(1, Math.max(0, (kk - d) / 0.65)); return s * s * (3 - 2 * s); };
    const isCap = (p) => /^(cap|leg)/.test(p.name);
    const exOf = (p) => p.prod !== 'shared' ? p.explode : (isCap(p) ? D.capEx[st.prod] : D.swEx[st.prod]) || 0;
    const zOf = (p) => p.prod === 'shared' ? (D.ptShift[st.prod] || 0) : (p.prod === 'acc_mat' && st.case && st.prod !== 'kb' ? -D.sil : 0);
    function visible(p) {
      if (st.prod === 'kb') return false;
      if (p.prod === 'acc_case') return st.case && CASEABLE.includes(st.prod);
      if (p.prod === 'acc_case_m') return st.case && METAL_LINE.includes(st.prod);
      if (p.prod === 'acc_tether') return st.tether && CASEABLE.includes(st.prod);
      if (p.prod === 'acc_mat') return st.mat;
      if (p.prod === 'shared') return !isCap(p) || p.name.endsWith('gmk');
      return p.prod === st.prod;
    }
    function paint() {
      const C = COLORS[st.color];
      P.forEach((p) => {
        const m = p.mesh.material; let c, met = 0, rough = .5, env = .5, cc = 0;
        if (p.role === 'case') { c = C.hex; rough = C.matte || .46; cc = C.matte ? 0 : .25; env = C.matte ? .35 : .6; }
        else if (p.role === 'alu') { c = C.hex; met = .85; rough = .38; env = 1; }
        else if (p.role === 'metal') { const M = METAL[st.metal]; c = M[0]; met = 1; rough = M[1]; env = 1.05; }
        else if (p.role === 'leggmk') { c = C.legend; rough = .9; env = .04; }
        else if (p.role === 'silicone') { c = new THREE.Color(C.hex).lerp(new THREE.Color(0x8a8f96), .28).getHex(); rough = .92; env = .18; }
        else if (p.role === 'cork') { c = 0xffffff; rough = .95; env = .1; m.map = corkTex; }
        else if (p.role === 'cord') { c = 0x24272b; rough = .8; env = .2; }
        else { const R = ROLE[p.role] || [0x888888, 0, .5]; c = R[0]; met = R[1]; rough = R[2]; env = met ? 1 : (p.role.startsWith('cap') ? .2 : .45); }
        const tc = new THREE.Color(c).convertSRGBToLinear(); if (!m.userData.tc) m.color.copy(tc); m.userData.tc = tc;
        m.metalness = met; m.roughness = rough; m.envMapIntensity = env; m.clearcoat = cc; m.needsUpdate = true; p.mesh.visible = visible(p);
      });
      if (KB) { KB.root.visible = st.prod === 'kb'; ['block', 'acc', 'stem'].forEach((n) => { const tc = new THREE.Color(C.hex).convertSRGBToLinear(); if (!KB.mats[n].userData.tc) KB.mats[n].color.copy(tc); KB.mats[n].userData.tc = tc; }); }
      stars.visible = st.space; host.classList.toggle('space', st.space);
      const caseOn = st.case && st.prod !== 'kb', matOn = st.mat && st.prod !== 'kb';
      shadow.position.z = st.prod === 'kb' ? 0.05 : -(caseOn ? D.sil : 0) - (matOn ? D.mat.t : 0) - 0.05;
      const s = st.prod === 'kb' ? 420 : matOn ? 150 : 46; shadow.scale.set(s, st.prod === 'kb' ? 230 : s, 1); shadow.material.opacity = st.space ? .7 : .45;
    }
    function kbPose(kk, now) {
      if (!KB) return; const t = pressT >= 0 && now >= 0 ? (now - pressT) / 1000 : -1;
      KB.parts.forEach((q) => { let pr = 0;
        if (t >= 0 && q.key !== undefined) { const u = t - q.key * 0.012; if (u > 0 && u < .07) pr = u / .07; else if (u >= .07 && u < .12) pr = 1; else if (u >= .12 && u < .36) { const v = (u - .12) / .24; pr = 1 - v * v * (3 - 2 * v); } }
        q.o.position.z = q.base + q.ex * stag(kk, q.ex, 46) - (q.key !== undefined ? 4 * pr : 0); });
    }
    function frameFor(kk) {
      if (st.prod === 'kb' && KB) { kbPose(kk, -1); KB.root.updateMatrixWorld(true); const bx = new THREE.Box3().setFromObject(KB.root); const c = new THREE.Vector3(); bx.getCenter(c); const sz = new THREE.Vector3(); bx.getSize(sz); return { center: c, radius: .5 * sz.length() * 1.05 }; }
      const box = new THREE.Box3();
      P.forEach((p) => { if (!visible(p)) return; const b = p.mesh.geometry.boundingBox.clone(); const dz = exOf(p) * kk + zOf(p); b.min.z += dz; b.max.z += dz; box.union(b); });
      const c = new THREE.Vector3(); box.getCenter(c); const sz = new THREE.Vector3(); box.getSize(sz); return { center: new THREE.Vector3(c.x, c.z, -c.y), radius: .5 * sz.length() };
    }
    function resize() { const w = host.clientWidth || 300, h = host.clientHeight || 300; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    const ro = new ResizeObserver(() => { resize(); }); ro.observe(host); resize();
    function fitDist(r) { const vh = THREE.MathUtils.degToRad(camera.fov) / 2, hh = Math.atan(Math.tan(vh) * camera.aspect); return r / Math.sin(Math.min(vh, hh)) * 1.02; }
    const VIEW = { kb: [-0.35, 0.62] }, DEF = [-0.72, 0.36];
    function place(f, az, el) { const d = fitDist(f.radius); controls.target.copy(f.center); camera.position.set(f.center.x + Math.sin(az) * Math.cos(el) * d, f.center.y + Math.sin(el) * d, f.center.z + Math.cos(az) * Math.cos(el) * d); controls.update(); }
    function homePose() { const v = VIEW[st.prod] || DEF, f = frameFor(st.exploded ? 1 : 0), d = fitDist(f.radius);
      return { t: f.center.clone(), p: new THREE.Vector3(f.center.x + Math.sin(v[0]) * Math.cos(v[1]) * d, f.center.y + Math.sin(v[1]) * d, f.center.z + Math.cos(v[0]) * Math.cos(v[1]) * d) }; }
    function home() { const h = homePose(); controls.target.copy(h.t); camera.position.copy(h.p); controls.update(); atHome = true; }
    let ret = null;
    function returnHome() {
      controls.enableDamping = false; controls.update(); controls.enableDamping = true;   // flush leftover drag momentum so it can't drift after the glide
      const h = homePose(), s0 = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target)), s1 = new THREE.Spherical().setFromVector3(h.p.clone().sub(h.t));
      let dth = s1.theta - s0.theta; if (dth > Math.PI) dth -= 2 * Math.PI; if (dth < -Math.PI) dth += 2 * Math.PI;
      ret = { t0: performance.now(), a: controls.target.clone(), b: h.t, s0, s1, dth };
    }
    let glide = null;
    function refit() { const f = frameFor(st.exploded ? 1 : 0); glide = { t0: performance.now(), a: controls.target.clone(), b: f.center, d0: camera.position.distanceTo(controls.target), d1: fitDist(f.radius) }; }
    const ease = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    paint(); home();
    let actx = null;
    function click(t0, soft) {
      try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume();
        const t = actx.currentTime + (t0 || 0), n = actx.createBuffer(1, actx.sampleRate * 0.03, actx.sampleRate), d = n.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (actx.sampleRate * 0.004));
        const src = actx.createBufferSource(); src.buffer = n; const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3800; bp.Q.value = 0.9;
        const gn = actx.createGain(); gn.gain.value = soft ? 0.38 : 0.9; src.connect(bp).connect(gn).connect(actx.destination); src.start(t);
        const o = actx.createOscillator(), og = actx.createGain(); o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(80, t + 0.09);
        og.gain.setValueAtTime(soft ? 0.12 : 0.5, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.12); o.connect(og).connect(actx.destination); o.start(t); o.stop(t + 0.13);
      } catch (e) { /* no audio */ }
    }
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    let keyDown = false, keyTarget = 0, keyX = 0, keyV = 0;
    const capMeshes = () => P.filter((p) => p.press && p.mesh.visible).map((p) => p.mesh);
    function hitKey(ev) {
      const r = renderer.domElement.getBoundingClientRect(); ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera); return ray.intersectObjects(capMeshes(), false).length > 0;
    }
    renderer.domElement.addEventListener('pointerdown', (ev) => {
      lastTouch = performance.now(); ret = null;
      if (st.exploded || !hitKey(ev)) { controls.__dragging = true; return; }
      keyDown = true; keyTarget = 1; controls.enabled = false; click(0); if (navigator.vibrate) navigator.vibrate(8);
    }, { capture: true });
    const release = () => { controls.__dragging = false; if (!keyDown) return; keyDown = false; keyTarget = 0; controls.enabled = true; click(0.0, true); lastTouch = performance.now(); };
    addEventListener('pointerup', release); addEventListener('pointercancel', release);
    let alive = true;
    function loop() { const now = performance.now();   // one clock for touches and frames
      if (!alive) return;
      const target = st.exploded ? 1 : 0; k += (target - k) * 0.09; if (Math.abs(target - k) < 1e-3) k = target;
      if (glide) { const u = Math.min(1, (now - glide.t0) / 900), e = ease(u); controls.target.copy(glide.a).lerp(glide.b, e); const dir = camera.position.clone().sub(controls.target).normalize(); camera.position.copy(controls.target).add(dir.multiplyScalar(glide.d0 + (glide.d1 - glide.d0) * e)); if (u >= 1) glide = null; }
      const dt = 1 / 60, K = keyTarget > keyX ? 2600 : 1400, C = keyTarget > keyX ? 95 : 48;   // fast down, quick sprung return
      keyV += (K * (keyTarget - keyX) - C * keyV) * dt; keyX += keyV * dt; if (keyX > 1) { keyX = 1; keyV = 0; } const pr = keyX;
      if (!atHome && !keyDown && !controls.__dragging && !ret && !glide && now - lastTouch > 5000) returnHome();
      if (ret) { const u = Math.min(1, (now - ret.t0) / 1400), e = ease(u);
        controls.target.copy(ret.a).lerp(ret.b, e);
        const sp = new THREE.Spherical(ret.s0.radius + (ret.s1.radius - ret.s0.radius) * e, ret.s0.phi + (ret.s1.phi - ret.s0.phi) * e, ret.s0.theta + ret.dth * e);
        camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sp)); if (u >= 1) { ret = null; atHome = true; } }
      let mx = 1; P.forEach((p) => { if (p.mesh.visible) mx = Math.max(mx, Math.abs(exOf(p))); });
      P.forEach((p) => { p.mesh.position.z = exOf(p) * stag(k, exOf(p), mx) + zOf(p) + (p.press ? -4 * pr : 0); const tc = p.mesh.material.userData.tc; if (tc) p.mesh.material.color.lerp(tc, 0.12); });
      if (KB) { if (st.prod === 'kb') kbPose(k, now); ['block', 'acc', 'stem'].forEach((n) => { const tc = KB.mats[n].userData.tc; if (tc) KB.mats[n].color.lerp(tc, 0.12); }); }
      stars.rotation.y += 0.0003; if (!ret) controls.update(); renderer.render(scene, camera); requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    return {
      set(o) { const prev = Object.assign({}, st); Object.assign(st, o); paint(); if (o.prod && o.prod !== prev.prod) { glide = null; home(); } else if (['exploded', 'case', 'mat', 'tether'].some((k2) => k2 in o && o[k2] !== prev[k2])) refit(); },
      press() { keyTarget = 1; click(0); setTimeout(() => { keyTarget = 0; click(0, true); }, 110); },
      reset() { glide = null; home(); },
      snap(o) { Object.assign(st, o || {}); k = st.exploded ? 1 : 0; paint(); P.forEach((p) => { const tc = p.mesh.material.userData.tc; if (tc) p.mesh.material.color.copy(tc); }); resize(); home(); controls.autoRotate = false; renderer.render(scene, camera); },
      dispose() { alive = false; ro.disconnect(); renderer.dispose(); host.replaceChildren(); },
      state: st,
    };
  }
  window.KB_COLORS = {
    orange: { name: 'Orange', hex: 0xf2672e, legend: 0xe2561f }, azure: { name: 'Dark Azure', hex: 0x10333d, legend: 0x10333d },
    cherry: { name: 'Cherry', hex: 0xc8102e, legend: 0xc8102e }, blue: { name: 'Electric Blue', hex: 0x0b5bff, legend: 0x0b5bff },
    tennis: { name: 'Tennis Ball', hex: 0xa8e62a, legend: 0x5c8c0e, matte: .72 }, powder: { name: 'Powder', hex: 0xf4b3cf, legend: 0xd8608f, matte: .78 } };
  window.ShopViewer = { create };
})();
