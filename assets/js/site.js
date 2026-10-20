// Key Bored: shared site behavior (bag, sign-ups, product pages, bag page).
(function () {
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const money = (n) => `$${n}`;
  const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k) || d); } catch (e) { return JSON.parse(d); } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } } };
  const bag = { get: () => store.get('kb_bag', '[]'), put(v) { store.set('kb_bag', v); badge(); } };
  function badge() { const n = bag.get().length; $$('[data-bag-count]').forEach((b) => { b.textContent = n ? `Bag · ${n}` : 'Bag'; }); }
  function modal(title, text, link) {
    const m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog');
    const c = document.createElement('div'); c.className = 'modal-card'; const h = document.createElement('h2'); h.textContent = title; const p = document.createElement('p'); p.textContent = text; c.append(h, p);
    if (link) { const a = document.createElement('a'); a.className = 'button'; a.href = link[1]; a.textContent = link[0]; c.append(a, document.createTextNode(' ')); }
    const b = document.createElement('button'); b.className = 'button secondary'; b.type = 'button'; b.textContent = 'Close'; c.append(b); m.append(c);
    m.addEventListener('click', (e) => { if (e.target === m || e.target === b) m.remove(); }); document.body.append(m);
  }
  // ---------- sign-up forms: Airtable when configured, otherwise saved on this device ----------
  const AT = ((window.KB_CONFIG || {}).airtableForm || '').trim(), shr = AT.match(/shr[A-Za-z0-9]+/), app = AT.match(/app[A-Za-z0-9]+/);
  $$('form[data-signup]').forEach((f) => {
    if (shr) {
      const q = new URLSearchParams({ backgroundColor: 'gray', prefill_List: f.dataset.signup, hide_List: 'true', prefill_Page: location.pathname, hide_Page: 'true' });
      const fr = document.createElement('iframe'); fr.className = 'airtable-embed'; fr.loading = 'lazy'; fr.title = 'Sign up';
      fr.src = `https://airtable.com/embed/${app ? app[0] + '/' : ''}${shr[0]}?${q}`; fr.height = f.dataset.signup === 'press' ? 620 : 470;
      $('.signup-row', f).replaceWith(fr); const m = $('.form-msg', f); if (m) m.remove(); f.removeAttribute('action'); f.addEventListener('submit', (ev) => ev.preventDefault()); return;
    }
    f.addEventListener('submit', (ev) => {
      ev.preventDefault(); const msg = $('.form-msg', f), email = $('input[type=email]', f).value.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) { msg.textContent = 'Please enter a valid email.'; return; }
      const l = store.get('kb_signups', '[]'); l.push({ email, list: f.dataset.signup, t: Date.now() }); store.set('kb_signups', l);
      f.classList.add('done'); msg.textContent = f.dataset.thanks || "You're on the list. We'll email you before anything goes on sale.";
    });
  });
  // ---------- product page ----------
  const pd = $('#product-data');
  if (pd) {
    const p = JSON.parse(pd.textContent), opt = { prod: p.viewer, color: p.default.color, keycap: 'gmk' };
    const booth = $('.pviewer'), buy = $('.button.buy'), colorName = $('[data-color-name]');
    let viewer = null;
    $$('.swatch').forEach((b) => b.addEventListener('click', () => {
      $$('.swatch').forEach((x) => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true');
      opt.color = b.dataset.color; colorName.textContent = b.title; viewer && viewer.set({ color: opt.color });
    }));
    const ex = $('[data-explode]');
    ex && ex.addEventListener('click', () => { const on = ex.getAttribute('aria-pressed') !== 'true'; ex.setAttribute('aria-pressed', String(on)); ex.textContent = on ? 'Put it back together' : 'Explode'; viewer && viewer.set({ exploded: on }); });
    buy.addEventListener('click', () => {
      bag.put([...bag.get(), { id: p.id, name: p.name, color: colorName.textContent, price: p.price }]);
      buy.classList.add('added'); buy.firstChild.textContent = 'Added to pre-order bag'; setTimeout(() => { buy.classList.remove('added'); buy.firstChild.textContent = 'Pre-order'; }, 1500);
    });
    (async () => {
      try {
        if (!window.THREE || !window.ShopViewer) throw new Error('no 3D');
        const r = await fetch('/assets/shop/models.json'); if (!r.ok) throw new Error('models ' + r.status); const m = await r.json();
        const img = $('img', booth); viewer = window.ShopViewer.create(booth, m.d, null, opt); if (img) img.remove();
        booth.classList.add('live');
      } catch (e) { booth.classList.add('static'); if (ex) ex.hidden = true; }
    })();
  }
  // ---------- bag page ----------
  const root = $('#bag-root');
  function renderBag() {
    if (!root) return; const items = bag.get(); root.replaceChildren();
    if (!items.length) { root.innerHTML = '<p class="summary">Nothing here yet. <a href="/shop/">Browse the shop</a></p>'; return; }
    const list = document.createElement('div'); list.className = 'bag-list';
    items.forEach((it, i) => { const row = document.createElement('div'); row.className = 'bag-item';
      row.innerHTML = '<div><strong></strong><p class="quiet"></p></div><div class="bag-right"><span></span><button class="link" type="button">Remove</button></div>';
      $('strong', row).textContent = `${it.name} (pre-order)`; $('p', row).textContent = it.color; $('.bag-right span', row).textContent = money(it.price);
      $('button', row).addEventListener('click', () => { const v = bag.get(); v.splice(i, 1); bag.put(v); renderBag(); }); list.append(row); });
    const total = items.reduce((s, x) => s + x.price, 0), tot = document.createElement('div'); tot.className = 'bag-total'; tot.innerHTML = '<span>Subtotal</span><strong></strong>'; $('strong', tot).textContent = money(total);
    const go = document.createElement('button'); go.className = 'button buy'; go.type = 'button'; go.textContent = 'Place pre-order';
    go.addEventListener('click', () => modal('Pre-orders open soon', 'Checkout is not live yet. Join the waitlist and we will email you the moment Batch 001 opens. Your bag stays saved on this device.', ['Join the waitlist', '/waitlist/']));
    root.append(list, tot, go);
  }
  renderBag(); badge();
})();
