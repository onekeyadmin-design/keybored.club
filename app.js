// Key Bored: public site. Home, OneKey shop, product pages, pre-order bag, pre-order info.
(function () {
  const main = document.getElementById('main');
  const el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag); attrs = attrs || {};
    for (const [k, v] of Object.entries(attrs)) { if (k === 'text') n.textContent = v; else if (k === 'class') n.className = v; else if (k === 'style') n.style.cssText = v; else n.setAttribute(k, v); }
    kids.flat().forEach((k) => k && n.append(k)); return n;
  };
  const set = (...k) => { main.replaceChildren(...k.flat().filter(Boolean)); main.classList.remove('enter'); void main.offsetWidth; main.classList.add('enter'); window.scrollTo(0, 0); };
  const route = () => { const h = location.hash.replace(/^#\/?/, ''), p = h.match(/^p\/([a-z0-9-]{1,20})$/);
    return p ? { page: 'product', id: p[1] } : ['onekey', 'bag', 'preorder'].includes(h) ? { page: h } : { page: 'home' }; };
  const getJSON = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(`${u}: ${r.status}`); return r.json(); };
  let viewer = null, models = null, cat = null;
  const loadCat = async () => cat || (cat = await getJSON('/assets/shop/catalog.json'));
  const money = (n) => `$${n}`;
  const hex = (n) => '#' + n.toString(16).padStart(6, '0');
  const colorKeys = () => Object.keys(window.KB_COLORS);
  const bag = { get() { try { return JSON.parse(localStorage.getItem('kb_bag') || '[]'); } catch (e) { return []; } }, put(v) { localStorage.setItem('kb_bag', JSON.stringify(v)); badge(); } };
  function badge() { const n = bag.get().length, b = document.getElementById('bagLink'); if (b) b.textContent = n ? `Bag · ${n}` : 'Bag'; }
  function poNote(c) { return el('div', { class: 'po-note' }, el('strong', { text: `Pre-order · ships ${c.preorder.ship}` }), c.preorder.note + ' ', el('a', { href: '#/preorder', text: 'How pre-orders work' })); }
  function storyBlock(s) { return el('section', { class: 'story' }, el('p', { class: 'eyebrow', text: 'Our story' }), el('h2', { text: s.title }), ...s.paras.map((t) => el('p', { text: t }))); }
  function modal(title, text) {
    const m = el('div', { class: 'modal', role: 'dialog' }, el('div', { class: 'modal-card' }, el('h2', { text: title }), el('p', { text }), el('button', { class: 'button', type: 'button', text: 'Close' })));
    m.addEventListener('click', (e) => { if (e.target === m || e.target.tagName === 'BUTTON') m.remove(); }); document.body.append(m);
  }
  async function home() {
    const c = await loadCat();
    set(el('section', { class: 'brand-hero' }, el('h1', { class: 'brand-mark' }, el('span', { text: 'Key' }), el('span', { text: 'Bored' })),
        el('p', { class: 'brand-line', text: 'Desk objects, made one at a time.' })),
      el('a', { href: '#/onekey', 'aria-label': 'Shop OneKey' }, el('img', { class: 'hero-lineup', src: '/assets/lineup.jpg', alt: 'The OneKey lineup: Solid, Screw-in, Nested, and Stack' })),
      el('h2', { text: 'OneKey' }), el('p', { class: 'summary', text: 'One mechanical key, made properly. Five bodies, six colors, pre-orders opening soon.' }),
      el('div', { class: 'cta-row' }, el('a', { class: 'button', href: '#/onekey', text: 'Shop OneKey' }), el('a', { href: '#/preorder', text: 'How pre-orders work' })),
      storyBlock(c.story));
  }
  async function shop() {
    const c = await loadCat();
    const grid = el('div', { class: 'shop-grid' }, ...c.products.map((p) => el('a', { class: 'card', href: `#/p/${p.id}` },
      el('div', { class: 'card-shot' }, el('img', { src: `/assets/shop/img/${p.id}.png`, alt: p.name, loading: 'lazy' }), p.concept ? el('span', { class: 'badge', text: 'Concept' }) : el('span', { class: 'po-badge', text: 'Pre-order' })),
      el('div', { class: 'card-info' }, el('div', { class: 'card-name', text: p.name }), el('p', { text: p.tagline }),
        el('div', { class: 'dots' }, ...colorKeys().map((k) => el('span', { class: 'dot', style: `background:${hex(window.KB_COLORS[k].hex)}`, title: window.KB_COLORS[k].name }))),
        el('div', { class: 'card-price', text: p.concept ? 'Waitlist' : (p.metalPrices ? `From ${money(Math.min(...Object.values(p.metalPrices)))}` : money(p.price)) })))));
    set(el('section', { class: 'shop-hero' }, el('h1', { text: 'OneKey' }), el('p', { class: 'summary', text: 'One mechanical key, made properly. Pick a body, a color, and a keycap.' })), poNote(c), grid, storyBlock(c.story));
  }
  async function product(id) {
    const c = await loadCat(), p = c.products.find((x) => x.id === id);
    if (!p) { location.hash = '#/onekey'; return; }
    const opt = Object.assign({ color: 'orange', keycap: 'gmk', metal: 'brass' }, p.default, { prod: p.id, extras: {} });
    const booth = el('div', { class: 'pviewer' }, el('p', { class: 'booth-note', text: 'Loading 3D…' }));
    const priceEl = el('div', { class: 'pprice' }), buyPrice = el('span'), colorName = el('span', { class: 'quiet' });
    const ex = c.extras.filter((x) => x.fits.includes(p.id));
    const priceOf = () => (p.metalPrices ? p.metalPrices[opt.metal] : p.price) + ex.filter((x) => opt.extras[x.id]).reduce((s, x) => s + x.price, 0);
    const refresh = () => { priceEl.textContent = p.concept ? 'Concept' : money(priceOf()); buyPrice.textContent = p.concept ? '' : ` · ${money(priceOf())}`; };
    const chip = (label, on, fn) => { const b = el('button', { class: 'chip', type: 'button', text: label, 'aria-pressed': String(!!on) }); b.addEventListener('click', () => fn(b)); return b; };
    const pick = (fn) => (b) => { b.parentNode.querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); fn(); };
    const swatches = el('div', { class: 'swatches' }, ...colorKeys().map((k) => { const b = el('button', { class: 'swatch', type: 'button', title: window.KB_COLORS[k].name, 'aria-label': window.KB_COLORS[k].name, style: `background:${hex(window.KB_COLORS[k].hex)}`, 'aria-pressed': String(k === opt.color) });
      b.addEventListener('click', () => { swatches.querySelectorAll('.swatch').forEach((x) => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); opt.color = k; colorName.textContent = window.KB_COLORS[k].name; viewer && viewer.set({ color: k }); }); return b; }));
    colorName.textContent = window.KB_COLORS[opt.color].name;
    const rows = [el('div', { class: 'opt' }, el('div', { class: 'opt-label' }, 'Color  ', colorName), swatches)];
    if (p.metalPrices) rows.push(el('div', { class: 'opt' }, el('div', { class: 'opt-label', text: 'Holster' }), el('div', { class: 'chips' },
      ...Object.entries(p.metalPrices).map(([m, pr]) => chip(`${m[0].toUpperCase() + m.slice(1)} · ${money(pr)}`, opt.metal === m, pick(() => { opt.metal = m; refresh(); viewer && viewer.set({ metal: m }); }))))));
    if (ex.length) rows.push(el('div', { class: 'opt' }, el('div', { class: 'opt-label', text: 'Add' }), el('div', { class: 'chips' },
      ...ex.map((x) => chip(`${x.name} +${money(x.price)}`, false, (b) => { opt.extras[x.id] = !opt.extras[x.id]; b.setAttribute('aria-pressed', String(opt.extras[x.id])); refresh(); viewer && viewer.set({ [x.id]: opt.extras[x.id] }); })))));
    const tools = el('div', { class: 'booth-tools' }, chip('Press', false, () => viewer && viewer.press()),
      chip('See inside', false, (b) => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); viewer && viewer.set({ exploded: on }); }),
      chip('Space', false, (b) => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); viewer && viewer.set({ space: on }); }), chip('Reset', false, () => viewer && viewer.reset()));
    const add = el('button', { class: 'button buy', type: 'button' }, p.concept ? 'Join the waitlist' : 'Pre-order', buyPrice);
    add.addEventListener('click', () => {
      if (p.concept) return modal('You are on the list', 'We will let you know when OneKey 75 opens for reservations.');
      bag.put([...bag.get(), { id: p.id, name: p.name, color: window.KB_COLORS[opt.color].name, metal: p.metalPrices ? opt.metal : null, extras: ex.filter((x) => opt.extras[x.id]).map((x) => x.name), price: priceOf() }]);
      add.classList.add('added'); add.firstChild.textContent = 'Added to pre-order bag'; setTimeout(() => { add.classList.remove('added'); add.firstChild.textContent = 'Pre-order'; }, 1500);
    });
    refresh();
    set(el('p', { class: 'quiet crumbs' }, el('a', { href: '#/onekey', text: 'OneKey' }), `  /  ${p.name}`),
      el('div', { class: 'pgrid' }, el('div', { class: 'pmedia' }, booth, tools),
        el('div', { class: 'pbuy' }, p.concept ? el('span', { class: 'badge inline', text: 'Concept' }) : null, el('h1', { text: p.name }), el('p', { class: 'ptag', text: p.tagline }), priceEl, ...rows, add,
          p.concept ? el('p', { class: 'quiet small', text: 'A concept we are developing. Join the waitlist to hear when reservations open.' }) : poNote(c))),
      el('section', { class: 'pdetail' }, el('div', null, el('h2', { text: 'The details' }), el('p', { class: 'summary', text: p.blurb }), el('ul', { class: 'points' }, ...p.points.map((t) => el('li', { text: t })))),
        el('div', null, el('h2', { text: 'Specs' }), el('dl', { class: 'pspecs' }, ...p.specs.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: v })])))),
      storyBlock(c.story));
    try { models = models || await getJSON('/assets/shop/models.json'); booth.replaceChildren(); viewer = window.ShopViewer.create(booth, models.d, models.k, opt); }
    catch (e) { booth.replaceChildren(el('p', { class: 'booth-note', text: '3D view unavailable on this device.' })); }
  }
  async function bagPage() {
    const c = await loadCat(), items = bag.get(), total = items.reduce((s, x) => s + x.price, 0);
    const list = el('div', { class: 'bag-list' }, ...items.map((it, i) => { const rm = el('button', { class: 'link', type: 'button', text: 'Remove' });
      rm.addEventListener('click', () => { const v = bag.get(); v.splice(i, 1); bag.put(v); bagPage(); });
      return el('div', { class: 'bag-item' }, el('div', null, el('strong', { text: `${it.name} (pre-order)` }), el('p', { class: 'quiet', text: [it.color, it.metal && it.metal[0].toUpperCase() + it.metal.slice(1), ...it.extras].filter(Boolean).join(' · ') })), el('div', { class: 'bag-right' }, el('span', { text: money(it.price) }), rm)); }));
    const go = el('button', { class: 'button buy', type: 'button', text: 'Place pre-order' });
    go.addEventListener('click', () => modal('Pre-orders open soon', 'Checkout is not live yet. Your bag is saved on this device and will be ready when pre-orders open.'));
    set(el('p', { class: 'quiet crumbs' }, el('a', { href: '#/onekey', text: 'OneKey' }), '  /  Bag'), el('h1', { text: 'Your pre-order' }),
      items.length ? [list, el('div', { class: 'bag-total' }, el('span', { text: 'Subtotal' }), el('strong', { text: money(total) })), poNote(c), go]
                   : el('p', { class: 'summary' }, 'Nothing here yet. ', el('a', { href: '#/onekey', text: 'Browse OneKey' })));
  }
  async function preorder() {
    const c = await loadCat();
    const qa = (q, a) => [el('h3', { text: q }), el('p', { text: a })];
    set(el('p', { class: 'quiet crumbs' }, el('a', { href: '#/', text: 'Key Bored' }), '  /  Pre-orders'), el('h1', { text: 'How pre-orders work' }),
      el('p', { class: 'summary', text: `Everything in the Key Bored store is a pre-order. We make each batch to order, so what you buy today ships when production finishes. Current estimate: ${c.preorder.ship}.` }),
      el('h2', { text: 'The timeline' }),
      el('ol', { class: 'steps' }, ...[['Pre-order window', 'Choose your OneKey and place your order while the window is open.'], ['Production', 'When the window closes, we order parts in the exact quantities you ordered and start making them.'],
        ['Quality check', 'Every unit is assembled, clicked, and checked by hand.'], ['Shipping', 'Orders ship in batches. You get tracking by email.']].map(([t, d]) => el('li', null, el('strong', { text: t }), d))),
      el('h2', { text: 'Questions' }),
      el('section', { class: 'faq' }, ...qa('When am I charged?', 'At checkout, when you place your pre-order.'), ...qa('Can I cancel?', 'Yes, for a full refund, any time before production starts. After that, parts are already made for your order.'),
        ...qa('Will the ship date change?', 'Ship dates are estimates. If anything moves, we email every customer with the new timeline and the reason.'),
        ...qa('Can I combine items?', 'Yes. Everything in one pre-order ships together when the last item is ready.')));
  }
  async function render() {
    if (viewer) { try { viewer.dispose(); } catch (e) { /* gone */ } viewer = null; }
    const r = route();
    try { if (r.page === 'product') return await product(r.id); if (r.page === 'onekey') return await shop(); if (r.page === 'bag') return await bagPage(); if (r.page === 'preorder') return await preorder(); return await home(); }
    catch (e) { set(el('h1', { text: 'Something went wrong' }), el('p', { text: 'Please reload the page.' })); }
  }
  window.addEventListener('hashchange', render); badge(); render();
})();
