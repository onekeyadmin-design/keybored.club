// Key Bored intro: ride along with a keycap through hyperspace, then it turns and lands on an azure Nested OneKey.
(function () {
  const KEY = 'kb_intro_v2';
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const force = /[#&?]intro\b/.test(location.href);
  let played = false; try { played = sessionStorage.getItem(KEY) === '1'; } catch (e) { /* none */ }
  if (((played || reduce) && !force) || !window.THREE) return;

  // ---------- overlay ----------
  const mk = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt) n.textContent = txt; return n; };
  const ov = mk('div', 'intro'); ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Intro');
  const canvas = mk('canvas', 'intro-canvas');
  const load = mk('div', 'intro-load'), brand = mk('div', 'intro-brand'); brand.setAttribute('aria-hidden', 'true');
  brand.append(mk('span', null, 'Key'), mk('span', null, 'Bored'));
  const bar = mk('div', 'intro-bar'), fill = mk('span', 'intro-fill'), pct = mk('span', 'intro-pct', '0%'); bar.append(fill); load.append(brand, bar, pct);
  const title = mk('div', 'intro-title2'); title.append(mk('div', 'intro-name', 'OneKey'), mk('div', 'intro-by', 'by Key Bored'));
  const skip = mk('button', 'intro-skip', 'Skip'); skip.type = 'button';
  ov.append(canvas, load, title, skip); document.body.append(ov); document.documentElement.classList.add('intro-on');
  let done = false, renderer = null;
  function finish() {
    if (done) return; done = true; try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* none */ }
    stopWhoosh(); ov.classList.add('intro-out'); document.documentElement.classList.remove('intro-on');
    setTimeout(() => { ov.remove(); try { renderer && renderer.dispose(); } catch (e) { /* gone */ } }, 700);
  }
  skip.addEventListener('click', finish);

  // ---------- sound (unlocked by the first touch) ----------
  let actx = null, whoosh = null;
  const audio = () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) { actx = null; } return actx; };
  ov.addEventListener('pointerdown', () => { audio(); startWhoosh(); }, { once: true });
  function startWhoosh() {
    const a = actx; if (!a || a.state !== 'running' || whoosh || landed) return;
    const n = a.createBuffer(1, a.sampleRate * 2, a.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource(); src.buffer = n; src.loop = true;
    const lp = a.createBiquadFilter(); lp.type = 'bandpass'; lp.frequency.value = 900; lp.Q.value = 0.7;
    const g = a.createGain(); g.gain.value = 0; src.connect(lp).connect(g).connect(a.destination); src.start();
    whoosh = { src, lp, g };
  }
  function stopWhoosh() { if (whoosh && actx) { try { whoosh.g.gain.setTargetAtTime(0, actx.currentTime, 0.08); whoosh.src.stop(actx.currentTime + 0.4); } catch (e) { /* gone */ } } whoosh = null; }
  function landSound() {
    const a = actx; if (!a || a.state !== 'running') return; const t = a.currentTime;
    const o = a.createOscillator(), og = a.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.25);
    og.gain.setValueAtTime(0.7, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(og).connect(a.destination); o.start(t); o.stop(t + 0.32);
    [0, 0.12].forEach((dt, i) => { const n = a.createBuffer(1, a.sampleRate * 0.03, a.sampleRate), d = n.getChannelData(0);
      for (let k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * Math.exp(-k / (a.sampleRate * 0.004));
      const s = a.createBufferSource(); s.buffer = n; const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3800; const g = a.createGain(); g.gain.value = i ? .45 : .9;
      s.connect(bp).connect(g).connect(a.destination); s.start(t + dt); });
  }

  // ---------- scene ----------
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return finish(); }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(36, 1, 0.5, 6000);
  const lin = (h) => new THREE.Color(h).convertSRGBToLinear();
  if (window.OneKeyStudio) scene.environment = window.OneKeyStudio.studioEnvironment(renderer);
  const key = new THREE.DirectionalLight(lin(0xfff0e0), 1.6); key.position.set(-60, 100, 55);
  const rim = new THREE.DirectionalLight(lin(0x9cc8ff), 1.3); rim.position.set(70, 40, -60);
  scene.add(key, rim, new THREE.HemisphereLight(0x8fa3bd, 0x0a0c10, 0.2));
  function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();

  // hyperspace: streaks in a tunnel around the flight path; they stretch with speed
  const N = 1400, streak = new Float32Array(N * 6), seeds = [];
  for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, r = 40 + Math.random() * 420; seeds.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: -Math.random() * 3000 }); }
  const sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.BufferAttribute(streak, 3));
  const streaks = new THREE.LineSegments(sgeo, new THREE.LineBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.85 }));
  const flight = new THREE.Group(); flight.add(streaks); scene.add(flight);

  // ---------- load models (real progress) ----------
  let shown = 0, target = 0.06, readyAt = 0;
  async function fetchModels() {
    const r = await fetch('/assets/shop/models.json'); const total = Number(r.headers.get('content-length')) || 0;
    if (!r.body || !r.body.getReader || !total) { const j = await r.json(); target = 0.9; return j; }
    const rd = r.body.getReader(), parts = []; let got = 0;
    for (;;) { const { done: d, value } = await rd.read(); if (d) break; parts.push(value); got += value.length; target = 0.06 + 0.84 * got / total; }
    const all = new Uint8Array(got); let o = 0; for (const p of parts) { all.set(p, o); o += p.length; }
    return JSON.parse(new TextDecoder().decode(all));
  }
  const dec = (b, T) => { const x = atob(b), u = new Uint8Array(x.length); for (let i = 0; i < x.length; i++) u[i] = x.charCodeAt(i); return new T(u.buffer); };
  const decPos = (m) => { const q = dec(m.pos, Uint16Array), o = new Float32Array(q.length), s = m.q; for (let i = 0; i < q.length; i++) { const a = i % 3; o[i] = s[a] + q[i] * s[3 + a]; } return o; };
  const AZURE = 0x10333d;
  const MAT = { alu: [AZURE, .85, .38], brass: [0xe2b65c, 1, .2], steel: [0xc4c8cd, 1, .25], hsg: [0x2b2e33, 0, .55], hbot: [0x17191c, 0, .6], copper: [0xc8925a, 1, .25],
    stem: [0x5c6067, 0, .5], capgmk: [0xefe7d4, 0, .38], leggmk: [AZURE, 0, .9] };
  const unit = new THREE.Group(), capPivot = new THREE.Group(), capInner = new THREE.Group();
  capPivot.add(capInner); scene.add(unit, capPivot);
  let CAP_C = new THREE.Vector3(0, 20, 0);
  function build(models) {
    const D = models.d, shift = (D.ptShift && D.ptShift.nested) || 0;
    const want = ['nest_case', 'nest_wt', 'nest_scr', 'hsg', 'hbot', 'pins', 'stem', 'capgmk', 'leggmk'];
    const uRoot = new THREE.Group(); uRoot.rotation.x = -Math.PI / 2; unit.add(uRoot);
    const cRoot = new THREE.Group(); cRoot.rotation.x = -Math.PI / 2; capInner.add(cRoot);
    const box = new THREE.Box3();
    D.parts.filter((p) => want.includes(p.name)).forEach((p) => {
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(decPos(p), 3));
      g.setIndex(new THREE.BufferAttribute(dec(p.idx, p.i16 ? Uint16Array : Uint32Array), 1)); g.computeVertexNormals();
      const m = MAT[p.role] || [0x888888, 0, .5];
      const mesh = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: lin(m[0]), metalness: m[1], roughness: m[2], envMapIntensity: m[1] ? 1 : (p.role === 'capgmk' ? .22 : .4) }));
      if (p.prod === 'shared') mesh.position.z = shift;
      if (p.name === 'capgmk' || p.name === 'leggmk') { cRoot.add(mesh); g.computeBoundingBox(); const b = g.boundingBox.clone(); b.min.z += shift; b.max.z += shift; box.union(b); }
      else uRoot.add(mesh);
    });
    const c = new THREE.Vector3(); box.getCenter(c); CAP_C = new THREE.Vector3(c.x, c.z, -c.y);   // keycap center in world (Y up)
    capInner.position.copy(CAP_C).multiplyScalar(-1);                                             // spin about the keycap's own center
  }

  // ---------- timeline ----------
  const T_TURN = 2.7, T_LAND = 3.55, T_TEXT = 4.1, T_END = 5.9;
  const ease = { io: (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, out: (x) => 1 - Math.pow(1 - x, 3), in: (x) => x * x * x };
  const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  const FAR = new THREE.Vector3(0, 60, 260);                                         // where the keycap is during the flight, relative to the unit
  const qFly = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.62, 0.42, 0.1));  // top and legend angled back toward the camera
  const qSeat = new THREE.Quaternion();
  let t0 = 0, started = false, landed = false, manualT = null;
  function pose(t) {
    const turn = seg(t, T_TURN, T_LAND), et = ease.io(turn);
    const roll = (1 - et) * Math.sin(t * 1.6) * 0.35, wob = Math.sin(t * 7) * 0.05 * (1 - et);
    const q = qFly.clone().slerp(qSeat, et).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(wob, 0, roll)));
    const arc = new THREE.Vector3().lerpVectors(FAR, new THREE.Vector3(0, 0, 0), ease.in(turn) * 0.35 + et * 0.65);
    arc.y += Math.sin(Math.PI * turn) * 14 * (1 - turn);
    const bounce = t > T_LAND ? Math.abs(Math.sin((t - T_LAND) * 18)) * 1.6 * Math.exp(-(t - T_LAND) * 9) : 0;
    capPivot.position.copy(CAP_C).add(arc).add(new THREE.Vector3(0, bounce, 0)); capPivot.quaternion.copy(q);
    unit.visible = t > T_TURN - 0.45;
    const speed = 900 * (1 - ease.out(seg(t, T_TURN - 0.2, T_LAND + 0.2))) + 6, len = Math.max(0.6, speed * 0.05);
    for (let i = 0; i < N; i++) { const s = seeds[i], z = ((s.z + t * speed) % 3000 + 3000) % 3000 - 2600;
      streak[i * 6] = s.x; streak[i * 6 + 1] = s.y; streak[i * 6 + 2] = z; streak[i * 6 + 3] = s.x; streak[i * 6 + 4] = s.y; streak[i * 6 + 5] = z - len; }
    sgeo.attributes.position.needsUpdate = true;
    flight.position.copy(capPivot.position); streaks.material.opacity = 0.85 - 0.45 * seg(t, T_LAND, T_END);
    const kc = capPivot.position, shake = (1 - et) * 0.5;
    const camFly = new THREE.Vector3(kc.x + 24 + Math.sin(t * 13) * shake, kc.y + 20 + Math.cos(t * 11) * shake, kc.z + 66);
    const look = kc.clone().add(new THREE.Vector3(0, -2, -10));
    const reveal = ease.io(seg(t, T_TURN + 0.15, T_TEXT + 0.3)), az = -0.62, el = 0.42, d = 118, unitC = new THREE.Vector3(0, 9, 0);
    const camEnd = new THREE.Vector3(unitC.x + Math.sin(az) * Math.cos(el) * d, unitC.y + Math.sin(el) * d, unitC.z + Math.cos(az) * Math.cos(el) * d);
    camera.position.lerpVectors(camFly, camEnd, reveal); camera.lookAt(look.lerp(unitC, reveal));
    const pull = seg(t, T_LAND, T_END); if (pull > 0) camera.position.add(camera.position.clone().sub(unitC).multiplyScalar(0.14 * ease.out(pull)));
    if (whoosh && actx) { whoosh.g.gain.value = 0.22 * (1 - et); whoosh.lp.frequency.value = 600 + 1400 * (1 - et); }
    if (t >= T_LAND && !landed) { landed = true; stopWhoosh(); landSound(); }
    if (t >= T_TEXT) ov.classList.add('intro-show');
  }
  function frame(now) {
    if (done) return; requestAnimationFrame(frame);
    if (!started) {
      shown += (target - shown) * 0.12; if (target >= 1 && shown > 0.995) shown = 1;
      fill.style.transform = `scaleX(${shown})`; pct.textContent = Math.round(shown * 100) + '%';
      if (readyAt && shown === 1 && manualT === null) { started = true; t0 = now; ov.classList.add('intro-go'); startWhoosh(); }
      return;
    }
    const t = manualT !== null ? manualT : (now - t0) / 1000;
    pose(t); renderer.render(scene, camera);
    if (t > T_END && manualT === null) finish();
  }
  fetchModels().then((m) => { build(m); target = 1; readyAt = performance.now(); }).catch(() => finish());
  requestAnimationFrame(frame);
  window.OneKeyIntro = { finish, at(sec) { manualT = sec; if (!started) { started = true; ov.classList.add('intro-go'); } pose(sec); renderer.render(scene, camera); }, ready: () => !!readyAt };
})();
