/* OneKey viewer: loads a revision's model.json and gives it orbit, press, and explode.
   model.json: { travel, parts:[{name, mat, group, explode, press, pos(b64 Float32 xyz), idx(b64 Uint32)}] }
   CAD is Z-up in millimeters; the scene rotates it to Y-up. Explode moves groups straight up only. */
(function () {
  const lin = (hex) => new THREE.Color(hex).convertSRGBToLinear();
  const MATS = () => {
    const M = (o) => { const m = new THREE.MeshPhysicalMaterial(o); m.color.convertSRGBToLinear(); return m; };
    return {
      m01: M({ color: 0x3a3e45, metalness: .72, roughness: .36, envMapIntensity: .85 }),
      m02:    M({ color: 0xe2b65c, metalness: 1, roughness: .12, envMapIntensity: 1.05 }),
      m04:    M({ color: 0xb8bcc2, metalness: 1, roughness: .25 }),
      m05:     M({ color: 0xe6e8e2, metalness: 0, roughness: .92, envMapIntensity: .2 }),
      m06:      M({ color: 0x2b2e33, metalness: 0, roughness: .55, envMapIntensity: .3 }),
      m07:     M({ color: 0x17191c, metalness: 0, roughness: .6, envMapIntensity: .25 }),
      m08:     M({ color: 0x5c6067, metalness: 0, roughness: .5, envMapIntensity: .3 }),
      m09:   M({ color: 0xc8925a, metalness: 1, roughness: .25 }),
      m10:      M({ color: 0x34373d, metalness: 0, roughness: .72, envMapIntensity: .28 }),
      m11:   M({ color: 0xd9dde3, metalness: 0, roughness: .6, envMapIntensity: .3 }),
      m12:  Object.assign(M({ color: 0xffffff, metalness: 0, roughness: .05, transmission: .96, envMapIntensity: 1.0, clearcoat: 1, clearcoatRoughness: .05 }), { transparent: true }),
      m13:  Object.assign(M({ color: 0x3a414a, metalness: 0, roughness: .08, transmission: .62, envMapIntensity: .9, clearcoat: 1, clearcoatRoughness: .08 }), { transparent: true }),
      m14: M({ color: 0xf2672e, metalness: 0, roughness: .42, clearcoat: .4, envMapIntensity: .6 }),
      m15:  M({ color: 0xf1ead9, metalness: 0, roughness: .5, envMapIntensity: .5 }),
      m16:    M({ color: 0x23272c, metalness: 0, roughness: .5, envMapIntensity: .5 }),
      m17:   Object.assign(M({ color: 0xcff7d8, metalness: 0, roughness: .35, envMapIntensity: .5 }), { emissive: new THREE.Color(0x58ff8a).convertSRGBToLinear(), emissiveIntensity: .55 }),
      default:  M({ color: 0x888888, metalness: 0, roughness: .6 })
    };
  };
  function studioEnvironment(renderer) {
    const env = new THREE.Scene();
    const g = new THREE.SphereGeometry(400, 48, 24), pa = g.attributes.position, cols = [];
    for (let i = 0; i < pa.count; i++) {
      const y = pa.getY(i) / 400; let v;                       // linear radiance
      if (y < -0.12) v = 0.30 + 0.20 * (-y);                    // lit floor sweep
      else if (y < 0.12) v = 0.05;                              // dark horizon line
      else v = 0.03 + 0.95 * Math.exp(-Math.pow((y - 0.42) / 0.17, 2)); // overhead ring softbox
      cols.push(v * 1.03, v, v * 0.95);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    env.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const box = (w, h, col, k, p) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: lin(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); env.add(m); };
    box(260, 200, 0xfff1e3, 3.6, [-210, 170, 190]);   // soft 5000K key
    box(40, 200, 0xffb066, 2.4, [170, 30, -260]);     // warm 3000K back strip
    box(30, 320, 0xeef3ff, 2.2, [260, 40, 60]);       // vertical edge strip
    box(220, 120, 0x9fb3cc, 0.6, [60, -60, 280]);     // cool front fill
    const pm = new THREE.PMREMGenerator(renderer);
    const tex = pm.fromScene(env, 0.03, 0.1, 1000).texture;  // far = 1000: the studio sits ~400 units out
    pm.dispose(); return tex;
  }
  function decode(b64, T) { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return new T(u.buffer); }
  const ease = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.OneKeyStudio = { studioEnvironment, MATS, decode, lin };
})();
