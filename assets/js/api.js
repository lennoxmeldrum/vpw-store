/* =====================================================================
   API: the one seam between this storefront and the order system.
   ---------------------------------------------------------------------
   Everything the site shows or does goes through the functions below.
   Today they read data/catalog.json and keep demo orders in the browser.
   To go live, each function calls the manufacturer's system instead; the
   suggested endpoint is noted on each one. Nothing else in the site needs
   to change.
   ===================================================================== */
(function () {
  const store = {
    get(k, d) { try { const v = localStorage.getItem('hottag:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('hottag:' + k, JSON.stringify(v)); } catch (e) { /* private mode: ignore */ } },
  };

  let C = null;           // catalog
  const IDX = {};         // indexes

  function seeded(seed) {
    let s = 0;
    for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  function applyOverrides() {
    const ov = store.get('overrides', {});
    for (const p of C.products) {
      const o = ov[p.id];
      if (!o) continue;
      if (o.price != null) p.price = o.price;
      if (o.hidden != null) p.hidden = o.hidden;
    }
    const subs = store.get('submissions', []);
    for (const s of subs) {
      if (!C.products.find((p) => p.id === s.id)) C.products.push(s);
    }
    const settings = store.get('storeSettings', {});
    for (const t of C.talent) if (settings[t.key]) Object.assign(t, { storeSettings: settings[t.key] });
  }

  function index() {
    IDX.promo = Object.fromEntries(C.promotions.map((p) => [p.id, p]));
    IDX.talent = Object.fromEntries(C.talent.map((t) => [t.key, t]));
    IDX.team = Object.fromEntries(C.teams.map((t) => [t.key, t]));
    IDX.product = Object.fromEntries(C.products.map((p) => [p.id, p]));
    IDX.sku = {};
    for (const p of C.products) for (const v of p.variants) IDX.sku[v.sku] = { product: p, variant: v };
  }

  const API = {
    /** GET /catalog  (or /promotions, /talent, /products paged) */
    async load() {
      const res = await fetch('data/catalog.json', { cache: 'no-cache' });
      C = await res.json();
      applyOverrides();
      index();
      return C;
    },

    platform: () => C.platform,
    today: () => C.generated,
    promotions: () => [...C.promotions].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    promotion: (id) => IDX.promo[id],
    talent: (key) => IDX.talent[key],
    allTalent: () => C.talent,
    /** Everyone on a promotion's roster, including wrestlers whose home store is elsewhere. */
    talentFor: (promoId) => C.talent.filter((t) => t.promotion === promoId || (t.appearsIn || []).includes(promoId)),
    homeTalentFor: (promoId) => C.talent.filter((t) => t.promotion === promoId),
    team: (key) => IDX.team[key],
    teamsFor: (promoId) => C.teams.filter((t) => t.promotion === promoId),
    teamOf: (talentKey) => C.teams.find((t) => t.members.includes(talentKey)),

    /** A store is a wrestler, a tag team/stable, or a promotion. */
    storeInfo(key) {
      if (IDX.talent[key]) { const t = IDX.talent[key]; return { key, kind: 'talent', name: t.name, photo: t.photo, promo: IDX.promo[t.promotion], href: `#/p/${t.promotion}/${t.id}`, ref: t }; }
      if (IDX.team[key]) { const t = IDX.team[key]; const m = IDX.talent[t.members[0]]; return { key, kind: 'team', name: t.name, photo: m && m.photo, promo: IDX.promo[t.promotion], href: `#/p/${t.promotion}/${t.id}`, ref: t }; }
      if (IDX.promo[key]) { const p = IDX.promo[key]; return { key, kind: 'promotion', name: p.name, photo: p.logo, logo: true, promo: p, href: `#/p/${p.id}`, ref: p }; }
      return null;
    },

    /** GET /products?store=&promotion=&type=&q= */
    products(filter = {}) {
      let list = C.products.filter((p) => !p.hidden || filter.includeHidden);
      if (filter.store) list = list.filter((p) => p.store === filter.store);
      if (filter.promotion) list = list.filter((p) => p.promotion === filter.promotion);
      if (filter.talent) list = list.filter((p) => p.talent.includes(filter.talent));
      if (filter.type) list = list.filter((p) => p.type === filter.type);
      if (filter.fulfilment) list = list.filter((p) => p.fulfilment === filter.fulfilment);
      if (filter.q) {
        const q = filter.q.toLowerCase();
        list = list.filter((p) => (p.title + ' ' + p.talent.map((k) => IDX.talent[k]?.name || '').join(' ') + ' ' + (IDX.promo[p.promotion]?.name || '')).toLowerCase().includes(q));
      }
      return list;
    },
    product: (id) => IDX.product[id],

    /** GET /stock?sku=...  Live stock per variant. null = no limit (made to order / pre-order). */
    stock: (sku) => IDX.sku[sku] ? IDX.sku[sku].variant.stock : 0,
    variant: (sku) => IDX.sku[sku],

    /** POST /shipping/quote {country, items}. Ships from Vietnam. */
    shippingZone(country) {
      const zones = C.platform.shipping;
      return zones.find((z) => z.countries.includes(country)) || zones.find((z) => z.countries.includes('*'));
    },
    quoteShipping(country, method = 'standard') {
      const z = API.shippingZone(country);
      const [price, days] = z[method];
      return { zone: z.label, price, days };
    },

    // ----- Bags: one per store. Each store checks out separately. -----
    bags: () => store.get('bags', {}),
    saveBags: (b) => store.set('bags', b),

    /**
     * POST /checkout  {store, items:[{sku,qty}], currency, country, shipping, payment, contact}
     * Live: returns a hosted checkout URL (e.g. Stripe) for that store.
     * Demo: records an order in this browser and returns its id.
     */
    async createCheckout(storeKey, payload) {
      const orders = store.get('orders', []);
      const id = 'HT-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      const order = { id, store: storeKey, ...payload, placed: new Date().toISOString(), status: 'placed' };
      orders.unshift(order);
      store.set('orders', orders.slice(0, 30));
      return { orderId: id };
    },

    /** GET /orders/:id?email=  (order lookup) */
    order: (id) => store.get('orders', []).find((o) => o.id === id),
    findOrder: (id, email) => store.get('orders', []).find((o) => o.id.toUpperCase() === String(id).trim().toUpperCase() && (!email || (o.contact?.email || '').toLowerCase() === email.trim().toLowerCase())),
    orders: () => store.get('orders', []),

    // ----- Studio (talent self-service) -----

    /** GET /stores/:key/stats  Sales, orders, payouts. Demo numbers are generated per store. */
    storeStats(key) {
      const r = seeded(key);
      const products = C.products.filter((p) => p.store === key);
      const days = [];
      const end = new Date(C.generated + 'T00:00:00');
      for (let i = 29; i >= 0; i--) {
        const d = new Date(end); d.setDate(d.getDate() - i);
        const event = r() < 0.12; // show nights spike
        const units = Math.round((event ? 8 + r() * 14 : r() * 5));
        const avg = products.length ? products.reduce((a, p) => a + p.price, 0) / products.length : 25;
        days.push({ date: d.toISOString().slice(0, 10), units, sales: Math.round(units * avg * 100) / 100, event });
      }
      const countries = ['VN', 'VN', 'VN', 'SG', 'US', 'AU', 'PH', 'MY', 'JP', 'GB', 'TH', 'DE', 'CA', 'ID'];
      const statuses = ['Printing', 'Packed', 'Shipped', 'Shipped', 'Delivered', 'Delivered'];
      const recent = Array.from({ length: 8 }, (_, i) => {
        const p = products[Math.floor(r() * products.length)] || {};
        const qty = 1 + Math.floor(r() * 2);
        return { id: 'HT-' + Math.floor(100000 + r() * 899999), country: countries[Math.floor(r() * countries.length)], product: p.title, qty, total: (p.price || 0) * qty, status: statuses[Math.min(statuses.length - 1, Math.floor(i / 1.4))], daysAgo: i };
      });
      const top = products.map((p) => ({ p, units: Math.round(r() * 40) })).sort((a, b) => b.units - a.units).slice(0, 5);
      return { days, recent, top };
    },

    /** PATCH /products/:id {price, hidden} */
    updateProduct(id, patch) {
      const ov = store.get('overrides', {});
      ov[id] = { ...(ov[id] || {}), ...patch };
      store.set('overrides', ov);
      Object.assign(IDX.product[id], patch);
    },

    /** POST /stores/:key/designs (artwork + spec). Goes to the manufacturer for review. */
    submitDesign(product) {
      const subs = store.get('submissions', []);
      subs.unshift(product);
      store.set('submissions', subs.slice(0, 10));
      C.products.push(product);
      index();
    },
    submissions: (key) => store.get('submissions', []).filter((s) => s.store === key),

    /** PATCH /stores/:key {bio, featured, ...} */
    saveStoreSettings(key, settings) {
      const all = store.get('storeSettings', {});
      all[key] = settings;
      store.set('storeSettings', all);
      if (IDX.talent[key]) IDX.talent[key].storeSettings = settings;
    },

    prefs: { get: (k, d) => store.get('pref:' + k, d), set: (k, v) => store.set('pref:' + k, v) },
    resetDemo() { try { Object.keys(localStorage).filter((k) => k.startsWith('hottag:')).forEach((k) => localStorage.removeItem(k)); } catch (e) { /* ignore */ } },
  };

  window.API = API;
})();
