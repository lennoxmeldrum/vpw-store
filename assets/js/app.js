/* =====================================================================
   HOT TAG storefront mock-up: app shell, router and pages.
   Data comes only from window.API (assets/js/api.js).
   ===================================================================== */
(function () {
  'use strict';
  const t = (k, v) => I18N.t(k, v);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const up = (s) => String(s || '').toUpperCase();
  const app = () => $('#app');

  // Routing: normally the URL hash (#/p/vpw). Hosts that don't allow path-style hashes set
  // window.HT_MEMORY_ROUTER before this script, and navigation then stays inside the page.
  const MEMORY = !!window.HT_MEMORY_ROUTER;
  let memPath = '#/';
  const memStack = [];
  const here = () => (MEMORY ? memPath : (location.hash || '#/'));
  function go(h, replace) {
    if (MEMORY) { if (!replace && h !== memPath) memStack.push(memPath); memPath = h; closeSearch(); route(); }
    else if (replace) { history.replaceState(null, '', h); route(); }
    else location.hash = h;
  }

  // ---------------------------------------------------------------- icons
  const I = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    belt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 10h3l2-3h10l2 3h3v4h-3l-2 3H7l-2-3H2z" opacity=".35"/><circle cx="12" cy="12" r="4.2"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7Z"/><path d="M3 7l9 4 9-4M12 11v10"/></svg>',
    print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="1"/><path d="M7 14h10v7H7z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
    coins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 14v3c0 1.7 2.7 3 6 3s6-1.3 6-3v-4c0-1.7-2.7-3-6-3"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4Z"/><path d="M14 6l3 3"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5" stroke-linecap="round"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    arrow: '<svg viewBox="0 0 40 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M0 8h37M31 2l6 6-6 6"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9H17l.5-4h-4V9c0-.6.4-1 1-1Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.4 2.4 1.9 4 4.5 4.2v3.4c-1.6 0-3.1-.5-4.4-1.3v6.4c0 3.6-2.8 6.3-6.3 6.3S3.5 19.3 3.5 15.8s2.9-6.2 6.5-6v3.5c-1.6-.2-3 1-3 2.6 0 1.5 1.2 2.7 2.7 2.7s2.8-1.2 2.8-2.9V3H16Z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 8.2c-.2-1.6-1-2.7-2.6-2.9C17 5 12 5 12 5s-5 0-7.4.3C3 5.5 2.2 6.6 2 8.2 1.8 9.6 1.8 12 1.8 12s0 2.4.2 3.8c.2 1.6 1 2.7 2.6 2.9 2.4.3 7.4.3 7.4.3s5 0 7.4-.3c1.6-.2 2.4-1.3 2.6-2.9.2-1.4.2-3.8.2-3.8s0-2.4-.2-3.8ZM10 15.2V8.8l5.2 3.2-5.2 3.2Z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.2L4.8 21H1.6l7.5-8.6L1.3 3h6.6l4.5 5.7L17.5 3Zm-1.1 16.2h1.8L6.7 4.7H4.8l11.6 14.5Z"/></svg>',
    website: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
  };
  const MARK = '<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="3" fill="#f2f0ea"/><path d="M8 7h4v7h8V7h4v18h-4v-7h-8v7H8z" fill="#0b0b0b"/><path d="M1 25 25 1h6L1 31z" fill="#f05d4e" opacity=".95"/></svg>';

  // ---------------------------------------------------------------- reference data
  const COUNTRIES = [
    ['VN', 'Vietnam'], ['SG', 'Singapore'], ['MY', 'Malaysia'], ['TH', 'Thailand'], ['PH', 'Philippines'], ['ID', 'Indonesia'], ['KH', 'Cambodia'],
    ['LA', 'Laos'], ['MM', 'Myanmar'], ['BN', 'Brunei'], ['JP', 'Japan'], ['KR', 'South Korea'], ['HK', 'Hong Kong'], ['TW', 'Taiwan'], ['CN', 'China'],
    ['IN', 'India'], ['AU', 'Australia'], ['NZ', 'New Zealand'], ['US', 'United States'], ['CA', 'Canada'], ['MX', 'Mexico'], ['BR', 'Brazil'],
    ['GB', 'United Kingdom'], ['IE', 'Ireland'], ['DE', 'Germany'], ['FR', 'France'], ['ES', 'Spain'], ['IT', 'Italy'], ['NL', 'Netherlands'],
    ['SE', 'Sweden'], ['NO', 'Norway'], ['DK', 'Denmark'], ['PL', 'Poland'], ['AE', 'United Arab Emirates'], ['SA', 'Saudi Arabia'], ['ZA', 'South Africa'],
  ];
  const CNAME = Object.fromEntries(COUNTRIES);
  const EURO = ['DE', 'FR', 'ES', 'IT', 'NL', 'IE'];
  const CUR_FOR = { VN: 'VND', SG: 'SGD', MY: 'MYR', TH: 'THB', PH: 'PHP', ID: 'IDR', AU: 'AUD', JP: 'JPY', GB: 'GBP', CA: 'CAD' };
  EURO.forEach((c) => { CUR_FOR[c] = 'EUR'; });
  const flag = (cc) => cc && cc.length === 2 ? String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))) : '';
  const PAY_LOCAL = {
    VN: ['MoMo', 'ZaloPay', 'VNPay QR'], SG: ['PayNow', 'GrabPay'], MY: ['FPX', "Touch 'n Go", 'GrabPay'], TH: ['PromptPay', 'TrueMoney'],
    PH: ['GCash', 'Maya'], ID: ['QRIS', 'GoPay', 'OVO'], JP: ['Konbini', 'PayPay'], KR: ['KakaoPay'], AU: ['Afterpay'], NL: ['iDEAL'], DE: ['Klarna'],
  };
  const TYPE_LABEL = { tee: 'Tees', hoodie: 'Hoodies', tank: 'Tanks', photo: 'Signed photos', poster: 'Posters', cap: 'Caps', keychain: 'Keychains', accessory: 'Accessories' };
  const SIZE_CM = [['S', 48, 69], ['M', 51, 72], ['L', 54, 74], ['XL', 57, 76], ['2XL', 60, 78], ['3XL', 63, 80]];

  // ---------------------------------------------------------------- state
  const S = {
    currency: 'USD', lang: 'en', country: 'US',
    bags: {},
  };

  function initPrefs() {
    let region = 'US';
    try { region = (new Intl.Locale(navigator.language).maximize().region) || 'US'; } catch (e) { /* ignore */ }
    if (!CNAME[region]) region = 'US';
    S.country = API.prefs.get('country', region);
    S.currency = API.prefs.get('currency', CUR_FOR[S.country] || 'USD');
    S.lang = API.prefs.get('lang', (navigator.language || 'en').startsWith('vi') ? 'vi' : 'en');
    I18N.set(S.lang);
    S.bags = API.bags();
  }

  // ---------------------------------------------------------------- money
  function money(usd, cur = S.currency) {
    const c = API.platform().currencies[cur] || { rate: 1 };
    let v = usd * c.rate;
    let dec = 2;
    if (['VND', 'IDR'].includes(cur)) { v = Math.round(v / 1000) * 1000; dec = 0; }
    else if (['JPY', 'KRW'].includes(cur)) { v = Math.round(v / 10) * 10; dec = 0; }
    else if (['PHP', 'THB'].includes(cur)) { v = Math.round(v); dec = 0; }
    else if (Math.abs(v - Math.round(v)) < 0.005) { dec = 0; }
    try {
      return new Intl.NumberFormat(S.lang === 'vi' ? 'vi-VN' : 'en', { style: 'currency', currency: cur, currencyDisplay: 'narrowSymbol', minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v);
    } catch (e) { return c.symbol + v.toFixed(dec); }
  }
  const dateFmt = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString(S.lang === 'vi' ? 'vi-VN' : 'en-GB', opts);

  // ---------------------------------------------------------------- theme
  function themeVars(promo) {
    if (!promo) return '';
    const th = promo.theme || {};
    return `--brand:${th.primary};--on-brand:${th.onPrimary || '#fff'};--accent:${th.accent || th.primary};--accent-deep:${th.accentDeep || th.accent || th.primary};--frame:${th.accent || th.primary};--italic:${th.italic ? 'italic' : 'normal'};`;
  }
  function applyTheme(promo) {
    const el = app();
    el.setAttribute('style', themeVars(promo));
    el.classList.toggle('theme-neutral', !promo);
  }

  // ---------------------------------------------------------------- product helpers
  function artCtx(p) {
    const promo = API.promotion(p.promotion);
    const talent = p.talent.map((k) => API.talent(k)).filter(Boolean);
    return { talent, team: API.team(p.store), promo, theme: promo.theme || {} };
  }
  function productVisual(p, opts = {}) {
    if (p.images && p.images.length) {
      const src = p.images[opts.index || 0] || p.images[0];
      return `<img src="${esc(src)}" alt="${esc(p.title)}" loading="lazy">`;
    }
    const color = opts.color || (p.colors[0] && p.colors[0].hex);
    return Art.render(p, artCtx(p), { view: opts.view || Art.views(p)[0].view, color });
  }
  function totalStock(p) { return p.variants.reduce((a, v) => a + (v.stock == null ? Infinity : v.stock), 0); }
  function isSoldOut(p) { return p.fulfilment === 'stock' && totalStock(p) === 0; }
  function isLow(p) { return p.fulfilment === 'stock' && !isSoldOut(p) && p.variants.some((v) => v.stock > 0 && v.stock <= 4); }
  function isNew(p) { return (new Date(API.today()) - new Date(p.created)) / 864e5 <= 14; }
  function badgeFor(p) {
    if (isSoldOut(p)) return `<span class="badge sold">${t('sold')}</span>`;
    if (p.fulfilment === 'preorder') return `<span class="badge pre">${t('pre')}</span>`;
    if (isLow(p)) return `<span class="badge low">${t('low')}</span>`;
    if (isNew(p)) return `<span class="badge new">${t('new')}</span>`;
    return '';
  }
  function storeLabel(key) {
    const s = API.storeInfo(key);
    return s ? s.name : '';
  }

  // ---------------------------------------------------------------- components
  function socialsHTML(soc) {
    if (!soc) return '';
    return Object.entries(soc).filter(([k, v]) => v && I[k]).map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener" aria-label="${esc(k)}">${I[k]}</a>`).join('');
  }

  function rosterCard(tl, opts = {}) {
    const promo = API.promotion(tl.promotion);
    const kicker = tl.title || tl.nickname || (tl.team && API.team(tl.team) ? API.team(tl.team).name : '');
    const count = API.products({ store: tl.key }).length;
    const frame = opts.neutral ? `style="--frame:${promo.theme.accent || promo.theme.primary}"` : '';
    return `<a class="frame" href="#/p/${tl.promotion}/${tl.id}" ${frame}>
      ${tl.title ? `<span class="belt">${I.belt}${t('champions').replace(/s$/, '')}</span>` : ''}
      <div class="frame-media"><img src="${esc(tl.photo)}" alt="${esc(tl.name)}" loading="lazy"></div>
      <div class="frame-body">
        <div class="frame-kicker ${tl.title ? 'gold' : ''}">${esc(kicker)}</div>
        <div class="frame-name">${esc(tl.name)}</div>
        ${opts.compact ? '' : `<div class="frame-meta">${opts.showPromo || (opts.context && opts.context !== tl.promotion) ? `<img src="${esc(promo.logo)}" alt="${esc(promo.short)}">` : ''}<span>${opts.context && opts.context !== tl.promotion ? 'Store on ' + esc(promo.short) + ' · ' : ''}${count} ${t('items')}</span></div>`}
      </div>
    </a>`;
  }

  function productCard(p, opts = {}) {
    const promo = API.promotion(p.promotion);
    const s = API.storeInfo(p.store);
    const hasAlt = p.images && p.images.length > 1;
    const frame = opts.neutral ? `style="--frame:${promo.theme.accent || promo.theme.primary}"` : '';
    return `<a class="pcard ${isSoldOut(p) ? 'is-sold' : ''}" href="#/product/${p.id}" ${frame}>
      <div class="tile">
        <div class="badges">${badgeFor(p)}</div>
        ${productVisual(p)}
        ${hasAlt ? `<div class="alt"><img src="${esc(p.images[1])}" alt="" loading="lazy"></div>` : ''}
      </div>
      <div class="pcard-row"><div class="pcard-title">${esc(p.title)}</div><div class="pcard-price">${money(p.price)}</div></div>
      <div class="pcard-store">${opts.neutral ? `<img src="${esc(promo.logo)}" alt="">` : ''}<span>${esc(s ? s.name : '')}</span></div>
    </a>`;
  }

  function promoTile(p) {
    const n = API.talentFor(p.id).length;
    const c = API.products({ promotion: p.id }).length;
    return `<a class="promo-tile" href="#/p/${p.id}" style="--p:${p.theme.primary};--a:${p.theme.accent || p.theme.primary}">
      <span class="stripe"></span>
      <div class="logo-box ${p.logoOnLight ? 'light' : ''}"><img src="${esc(p.logo)}" alt="${esc(p.name)} logo" loading="lazy"></div>
      <div>
        <div class="pt-name">${esc(p.name)}</div>
        <div class="pt-meta"><span><span class="flag">${flag(p.countryCode)}</span> ${esc(p.city || p.country)}</span><span>${n} ${t('wrestlers')}</span><span>${c} ${t('products')}</span></div>
      </div>
    </a>`;
  }

  function champCard(promo, ch) {
    const holders = ch.holders.map((h) => API.talent(h.includes('/') ? h : `${promo.id}/${h}`)).filter(Boolean);
    if (!holders.length) return '';
    const tm = holders.length > 1 ? API.teamOf(holders[0].key) : null;
    const href = tm && holders.every((h) => tm.members.includes(h.key)) ? `#/p/${tm.promotion}/${tm.id}` : `#/p/${holders[0].promotion}/${holders[0].id}`;
    return `<a class="champ ${holders.length > 2 ? 'many' : ''}" href="${href}" style="${themeVars(promo)}">
      <div class="faces">${holders.map((h) => `<img src="${esc(h.photo)}" alt="${esc(h.name)}" loading="lazy">`).join('')}</div>
      <div><div class="t">${esc(ch.name)}</div><div class="n">${holders.length > 2 && tm ? esc(tm.name) : holders.map((h) => esc(h.name)).join(' &amp; ')}</div>
      <div class="small muted" style="margin-top:4px;display:flex;align-items:center;gap:6px"><img src="${esc(promo.logo)}" alt="" style="height:12px;width:auto"> ${esc(promo.short)}</div></div>
    </a>`;
  }

  function teamCard(tm) {
    const mem = tm.members.map((k) => API.talent(k)).filter(Boolean);
    return `<a class="team-card" href="#/p/${tm.promotion}/${tm.id}">
      <div class="faces">${mem.map((m) => `<img src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy">`).join('')}</div>
      <div><div class="n">${esc(tm.name)}</div><div class="small muted">${mem.map((m) => esc(m.name)).join(' · ')}</div></div>
    </a>`;
  }

  function sortProducts(list, sort) {
    const l = [...list];
    if (sort === 'new') l.sort((a, b) => b.created.localeCompare(a.created));
    else if (sort === 'lo') l.sort((a, b) => a.price - b.price);
    else if (sort === 'hi') l.sort((a, b) => b.price - a.price);
    else l.sort((a, b) => (isSoldOut(a) - isSoldOut(b)) || ((b.sample ? 0 : 1) - (a.sample ? 0 : 1)));
    return l;
  }

  // ---------------------------------------------------------------- chrome
  function renderChrome() {
    const P = API.platform();
    const curOpts = Object.keys(P.currencies).map((c) => `<option value="${c}" ${c === S.currency ? 'selected' : ''}>${c}</option>`).join('');
    const langOpts = [['en', 'EN'], ['vi', 'VI']].map(([v, l]) => `<option value="${v}" ${v === S.lang ? 'selected' : ''}>${l}</option>`).join('');
    $('#chrome').innerHTML = `
      <div class="ribbon"><b>Prototype.</b> Sample designs, prices and orders, for discussion. No real payments are taken.</div>
      <header class="site-header">
        <div class="wrap">
          <a class="wordmark" href="#/">${MARK}<span>${esc(P.name)}<small>${esc(P.tagline.toUpperCase())}</small></span></a>
          <nav class="nav" aria-label="Main">
            <a href="#/shop" data-nav="shop">${t('nav.shop')}</a>
            <a href="#/promotions" data-nav="promotions">${t('nav.promotions')}</a>
            <a href="#/wrestlers" data-nav="wrestlers">${t('nav.wrestlers')}</a>
            <a href="#/studio" data-nav="studio">${t('nav.studio')}</a>
            <a href="#/platform" data-nav="platform">${t('nav.platform')}</a>
          </nav>
          <div class="header-tools">
            ${MEMORY ? `<button class="icon-btn" data-act="back" aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button>` : ''}
            <button class="icon-btn" data-act="search" aria-label="${t('search')}">${I.search}</button>
            <label class="sr" for="cur-sel">${t('cur')}</label>
            <select id="cur-sel" class="select-pill hide-sm" data-act="currency" aria-label="${t('cur')}">${curOpts}</select>
            <select class="select-pill hide-sm" data-act="lang" aria-label="${t('lang')}">${langOpts}</select>
            <button class="icon-btn" data-act="bag" aria-label="${t('bags')}">${I.bag}<span class="bag-count" id="bag-count" hidden></span></button>
            <button class="icon-btn menu-btn" data-act="menu" aria-label="${t('menu')}">${I.menu}</button>
          </div>
        </div>
        <div class="mobile-nav" id="mobile-nav">
          <a href="#/shop">${t('nav.shop')}</a><a href="#/promotions">${t('nav.promotions')}</a><a href="#/wrestlers">${t('nav.wrestlers')}</a>
          <a href="#/studio">${t('nav.studio')}</a><a href="#/platform">${t('nav.platform')}</a><a href="#/help">${t('nav.help')}</a>
          <div class="row"><select class="select-pill" data-act="currency" aria-label="${t('cur')}">${curOpts}</select><select class="select-pill" data-act="lang" aria-label="${t('lang')}">${langOpts}</select></div>
        </div>
      </header>`;
    const promos = API.promotions();
    $('#footer').innerHTML = `
      <footer class="site-footer"><div class="wrap">
        <div class="foot-grid">
          <div>
            <a class="wordmark" href="#/">${MARK}<span>${esc(P.name)}<small>${esc(P.tagline.toUpperCase())}</small></span></a>
            <p class="muted small" style="max-width:36ch;margin-top:14px">${t('news.t')}</p>
            <form class="newsletter" data-form="news"><input type="email" required placeholder="you@example.com" aria-label="Email"><button class="btn btn-primary btn-sm">${t('news.b')}</button></form>
            <div class="foot-promos">${promos.map((p) => `<a href="#/p/${p.id}" aria-label="${esc(p.name)}"><img src="${esc(p.logo)}" alt="${esc(p.short)}"></a>`).join('')}</div>
          </div>
          <div><h4>${t('foot.shop')}</h4><a href="#/shop">${t('all')}</a><a href="#/shop?sort=new">${t('new.drops')}</a><a href="#/promotions">${t('nav.promotions')}</a><a href="#/wrestlers">${t('nav.wrestlers')}</a></div>
          <div><h4>${t('foot.help')}</h4><a href="#/help#shipping">${t('foot.ship')}</a><a href="#/help#returns">${t('foot.ret')}</a><a href="#/help#sizes">${t('foot.sizes')}</a><a href="#/orders">${t('foot.find')}</a></div>
          <div><h4>${t('foot.for')}</h4><a href="#/studio">${t('nav.studio')}</a><a href="#/platform">${t('nav.platform')}</a><a href="data/catalog.json" target="_blank">Sample data (JSON)</a></div>
          <div><h4>${t('cur')}</h4><select class="select-pill" data-act="currency" aria-label="${t('cur')}">${curOpts}</select><h4 style="margin-top:18px">${t('lang')}</h4><select class="select-pill" data-act="lang" aria-label="${t('lang')}">${langOpts}</select></div>
        </div>
        <div class="foot-bottom"><span>${esc(P.name)} is a working name. Made in ${esc(P.madeIn)}. Wrestler names, photos and promotion logos belong to their owners.</span><span><a href="#" data-act="reset">Reset demo data</a></span></div>
      </div></footer>`;
    updateBagCount();
  }

  function markNav(name) {
    $$('.nav a').forEach((a) => a.classList.toggle('on', a.dataset.nav === name));
  }

  // ---------------------------------------------------------------- bags
  function bagItems(storeKey) { return S.bags[storeKey] || []; }
  function bagCount() { return Object.values(S.bags).reduce((a, items) => a + items.reduce((b, i) => b + i.qty, 0), 0); }
  function saveBags() {
    for (const k of Object.keys(S.bags)) if (!S.bags[k].length) delete S.bags[k];
    API.saveBags(S.bags);
    updateBagCount();
  }
  function updateBagCount() {
    const el = $('#bag-count');
    if (!el) return;
    const n = bagCount();
    el.hidden = !n;
    el.textContent = n;
  }
  function addToBag(p, sku, qty) {
    const key = p.store;
    S.bags[key] = S.bags[key] || [];
    const ex = S.bags[key].find((i) => i.sku === sku);
    if (ex) ex.qty = Math.min(10, ex.qty + qty);
    else S.bags[key].push({ pid: p.id, sku, qty });
    saveBags();
    toast(t('added', { x: storeLabel(key) }), t('view.bag'), openBag);
  }
  function variantLabel(v) { return [v.color, v.size, v.option].filter(Boolean).join(' · '); }
  function bagSubtotal(items) { return items.reduce((a, i) => { const p = API.product(i.pid); return a + (p ? p.price * i.qty : 0); }, 0); }

  function renderBag() {
    const keys = Object.keys(S.bags).filter((k) => S.bags[k].length);
    const body = $('#drawer-body');
    if (!keys.length) {
      body.innerHTML = `<div class="empty">${I.bag}<p>${t('bags.empty')}</p><a class="btn btn-ghost btn-sm" href="#/shop" data-act="close-bag">${t('bags.browse')}</a></div>`;
      return;
    }
    body.innerHTML = `<div class="drawer-note">${I.info}<span>${t('bags.note')}</span></div>` + keys.map((k) => {
      const s = API.storeInfo(k);
      const th = s.promo.theme;
      const items = bagItems(k);
      return `<section class="bag" style="--b:${th.primary};--ob:${th.onPrimary || '#fff'}">
        <div class="bag-head"><img class="av ${s.logo ? 'logo' : ''}" src="${esc(s.photo)}" alt=""><div><b>${esc(s.name)}</b><small>${esc(t('store.of', { x: s.promo.short }))}</small></div><img class="pl" src="${esc(s.promo.logo)}" alt=""></div>
        ${items.map((i, idx) => {
          const p = API.product(i.pid); if (!p) return '';
          const v = (API.variant(i.sku) || {}).variant || {};
          const col = p.colors.find((c) => c.name === v.color);
          return `<div class="line-item">
            <a class="thumb" href="#/product/${p.id}" data-act="close-bag">${productVisual(p, { color: col && col.hex })}</a>
            <div><div class="t">${esc(p.title)}</div><div class="v">${esc(variantLabel(v))}</div>
              <div class="qty"><button data-act="qty" data-store="${esc(k)}" data-i="${idx}" data-d="-1" aria-label="Less">−</button><span>${i.qty}</span><button data-act="qty" data-store="${esc(k)}" data-i="${idx}" data-d="1" aria-label="More">+</button></div></div>
            <div><div class="p">${money(p.price * i.qty)}</div><button class="rm" data-act="rm" data-store="${esc(k)}" data-i="${idx}">${t('remove')}</button></div>
          </div>`;
        }).join('')}
        <div class="bag-foot"><div class="row"><span>${t('subtotal')}</span><b>${money(bagSubtotal(items))}</b></div>
          <a class="btn btn-primary btn-block" href="#/checkout/${k}" data-act="close-bag">${t('checkout')} · ${esc(s.name)}</a></div>
      </section>`;
    }).join('');
  }
  function openBag() { renderBag(); $('#drawer').classList.add('open'); $('#scrim').classList.add('open'); $('#drawer').setAttribute('aria-hidden', 'false'); }
  function closeBag() { $('#drawer').classList.remove('open'); $('#scrim').classList.remove('open'); $('#drawer').setAttribute('aria-hidden', 'true'); }

  let toastTimer;
  function toast(msg, actionLabel, action) {
    const el = $('#toast');
    el.innerHTML = `<span>${esc(msg)}</span>${actionLabel ? `<button type="button">${esc(actionLabel)}</button>` : ''}`;
    if (action) el.querySelector('button').onclick = () => { el.classList.remove('show'); action(); };
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3800);
  }

  // ---------------------------------------------------------------- search
  function openSearch() {
    const ov = $('#search-ov');
    ov.innerHTML = `<div class="wrap"><div class="top"><input class="search-input" id="q" type="search" placeholder="${esc(t('search.ph'))}" autocomplete="off"><button class="icon-btn" data-act="close-search" aria-label="${t('close')}">${I.close}</button></div><div id="q-res"></div></div>`;
    ov.classList.add('open');
    document.body.style.overflow = 'hidden';
    const input = $('#q');
    input.focus();
    input.addEventListener('input', () => renderSearch(input.value));
    renderSearch('');
  }
  function closeSearch() { $('#search-ov').classList.remove('open'); document.body.style.overflow = ''; }
  function renderSearch(q) {
    const res = $('#q-res');
    const s = q.trim().toLowerCase();
    if (!s) {
      res.innerHTML = `<div class="res-group"><h3 class="label">${t('nav.promotions')}</h3><div class="res-list">${API.promotions().map((p) => `<a class="res" href="#/p/${p.id}" data-act="close-search"><div class="im logo"><img src="${esc(p.logo)}" alt=""></div><div><b>${esc(p.name)}</b><small>${flag(p.countryCode)} ${esc(p.country)}</small></div></a>`).join('')}</div></div>`;
      return;
    }
    const promos = API.promotions().filter((p) => (p.name + ' ' + p.short + ' ' + p.country).toLowerCase().includes(s));
    const people = API.allTalent().filter((x) => (x.name + ' ' + (x.nickname || '') + ' ' + (x.title || '')).toLowerCase().includes(s)).slice(0, 12);
    const prods = API.products({ q: s }).slice(0, 12);
    if (!promos.length && !people.length && !prods.length) { res.innerHTML = `<p class="muted" style="margin-top:28px">${t('search.none')}</p>`; return; }
    res.innerHTML = [
      promos.length ? `<div class="res-group"><h3 class="label">${t('nav.promotions')}</h3><div class="res-list">${promos.map((p) => `<a class="res" href="#/p/${p.id}" data-act="close-search"><div class="im logo"><img src="${esc(p.logo)}" alt=""></div><div><b>${esc(p.name)}</b><small>${flag(p.countryCode)} ${esc(p.country)}</small></div></a>`).join('')}</div></div>` : '',
      people.length ? `<div class="res-group"><h3 class="label">${t('nav.wrestlers')}</h3><div class="res-list">${people.map((x) => `<a class="res" href="#/p/${x.promotion}/${x.id}" data-act="close-search"><div class="im"><img src="${esc(x.photo)}" alt=""></div><div><b>${esc(x.name)}</b><small>${esc(x.nickname || x.title || '')} · ${esc(API.promotion(x.promotion).short)}</small></div></a>`).join('')}</div></div>` : '',
      prods.length ? `<div class="res-group"><h3 class="label">${t('nav.shop')}</h3><div class="res-list">${prods.map((p) => `<a class="res" href="#/product/${p.id}" data-act="close-search"><div class="im">${productVisual(p)}</div><div><b>${esc(p.title)}</b><small>${money(p.price)} · ${esc(storeLabel(p.store))}</small></div></a>`).join('')}</div></div>` : '',
    ].join('');
  }

  // ================================================================= PAGES

  // ---------------------------------------------------------------- home
  function pageHome() {
    const promos = API.promotions();
    const all = API.allTalent();
    const pick = (n, off) => { const out = []; for (let i = 0; i < n; i++) out.push(all[(i * 7 + off) % all.length]); return out; };
    const rowA = pick(12, 0), rowB = pick(12, 3);
    const champs = promos.flatMap((p) => (p.championships || []).map((c) => champCard(p, c))).join('');
    // Newest first, but spread across promotions and product types so the row isn't eight of one thing.
    const drops = [];
    const seen = {};
    for (const p of sortProducts(API.products(), 'new').filter((x) => !isSoldOut(x))) {
      const k1 = p.promotion, k2 = p.promotion + p.type + (p.design ? p.design.style : 'img');
      if ((seen[k1] || 0) >= 2 || seen[k2]) continue;
      seen[k1] = (seen[k1] || 0) + 1; seen[k2] = 1;
      drops.push(p);
      if (drops.length === 8) break;
    }
    const featured = [];
    promos.forEach((p) => { API.homeTalentFor(p.id).slice(0, 2).forEach((x) => featured.push(x)); });
    const countries = new Set(promos.map((p) => p.countryCode)).size;
    return {
      title: `${API.platform().name}: ${API.platform().tagline}`,
      html: `
      <section class="hero">
        <div class="hero-marquee" aria-hidden="true">
          <div class="marquee-row">${[...rowA, ...rowA].map((x) => rosterCard(x, { compact: true, neutral: true })).join('')}</div>
          <div class="marquee-row rev">${[...rowB, ...rowB].map((x) => rosterCard(x, { compact: true, neutral: true })).join('')}</div>
        </div>
        <div class="wrap"><div class="hero-inner">
          <div class="label">${t('hero.k')} · ${t(countries === 1 ? 'promos.k1' : 'promos.k', { n: promos.length, c: countries })}</div>
          <h1 class="display" style="margin-top:14px"><span class="l">${t('hero.t1')}</span><span class="l">${t('hero.t2')}</span><span class="l outline">${t('hero.t3')}</span></h1>
          <p class="lede">${t('hero.sub')}</p>
          <div class="hero-ctas"><a class="btn btn-primary" href="#/promotions">${t('hero.c1')}</a><a class="btn btn-ghost" href="#/wrestlers">${t('hero.c2')}</a></div>
        </div></div>
      </section>

      <section class="section"><div class="wrap">
        <div class="section-head"><div><div class="label">${t(countries === 1 ? 'promos.k1' : 'promos.k', { n: promos.length, c: countries })}</div><h2 class="h-section" style="margin-top:8px">${t('nav.promotions')}</h2></div><a class="link-arrow" href="#/promotions">${t('see.all')}</a></div>
        <div class="grid-promos">${promos.map(promoTile).join('')}</div>
      </div></section>

      ${champs ? `<section class="section tight" style="background:#0f0f0f;border-top:1px solid var(--line);border-bottom:1px solid var(--line)"><div class="wrap">
        <div class="section-head"><h2 class="h-section">${t('champs.across')}</h2></div>
        <div class="champ-strip">${champs}</div>
      </div></section>` : ''}

      <section class="section"><div class="wrap">
        <div class="section-head"><h2 class="h-section">${t('new.drops')}</h2><a class="link-arrow" href="#/shop?sort=new">${t('see.all')}</a></div>
        <div class="grid-products">${drops.map((p) => productCard(p, { neutral: true })).join('')}</div>
      </div></section>

      <section class="section tight"><div class="wrap">
        <div class="section-head"><h2 class="h-section">${t('find')}</h2><a class="link-arrow" href="#/wrestlers">${t('see.all')} (${all.length})</a></div>
        <div class="grid-roster">${featured.slice(0, 12).map((x) => rosterCard(x, { neutral: true, showPromo: true })).join('')}</div>
      </div></section>

      <section class="section tight"><div class="wrap">
        <div class="props">
          <div class="prop">${I.pen}<h3>${t('p1.t')}</h3><p>${t('p1.d')}</p></div>
          <div class="prop">${I.print}<h3>${t('p2.t')}</h3><p>${t('p2.d')}</p></div>
          <div class="prop">${I.globe}<h3>${t('p3.t')}</h3><p>${t('p3.d')}</p></div>
          <div class="prop">${I.coins}<h3>${t('p4.t')}</h3><p>${t('p4.d')}</p></div>
        </div>
      </div></section>

      <section class="section tight"><div class="wrap">
        <div class="cta-band">
          <a href="#/studio"><div class="label">${t('nav.studio')}</div><h3>${t('cta.w.t')}</h3><p class="muted">${t('cta.w.d')}</p><span class="link-arrow" style="width:fit-content">${t('cta.w.b')}</span></a>
          <a href="#/platform"><div class="label">${t('nav.platform')}</div><h3>${t('cta.p.t')}</h3><p class="muted">${t('cta.p.d')}</p><span class="link-arrow" style="width:fit-content">${t('cta.p.b')}</span></a>
        </div>
      </div></section>`,
    };
  }

  // ---------------------------------------------------------------- promotions list
  function pagePromotions() {
    const promos = API.promotions();
    const countries = new Set(promos.map((p) => p.countryCode)).size;
    return {
      title: t('nav.promotions'), nav: 'promotions',
      html: `<section class="section"><div class="wrap">
        <div class="label">${t(countries === 1 ? 'promos.k1' : 'promos.k', { n: promos.length, c: countries })}</div>
        <h1 class="h-section" style="margin:8px 0 28px">${t('nav.promotions')}</h1>
        <div class="grid-promos">${promos.map(promoTile).join('')}
          <a class="promo-tile" href="#/platform" style="--p:#444;--a:#888;border-style:dashed"><div class="logo-box"><span class="display" style="font-size:44px;color:var(--muted)">+</span></div><div><div class="pt-name">Your promotion here</div><div class="pt-meta"><span>How stores are set up</span></div></div></a>
        </div>
      </div></section>`,
    };
  }

  // ---------------------------------------------------------------- wrestlers list
  function pageWrestlers(params, q) {
    const promos = API.promotions();
    const sel = q.get('promo') || '';
    const champsOnly = q.get('champs') === '1';
    const query = (q.get('q') || '').toLowerCase();
    let list = API.allTalent();
    if (sel) list = list.filter((x) => x.promotion === sel);
    if (champsOnly) list = list.filter((x) => x.title);
    if (query) list = list.filter((x) => (x.name + ' ' + (x.nickname || '')).toLowerCase().includes(query));
    const link = (k, v) => { const n = new URLSearchParams(q); if (v) n.set(k, v); else n.delete(k); const s = n.toString(); return '#/wrestlers' + (s ? '?' + s : ''); };
    return {
      title: t('nav.wrestlers'), nav: 'wrestlers',
      html: `<section class="section"><div class="wrap">
        <h1 class="h-section" style="margin-bottom:24px">${t('nav.wrestlers')} <span class="hl">${list.length}</span></h1>
        <div class="filterbar"><div class="grow"><input class="search-input" type="search" placeholder="${esc(t('search.ph'))}" value="${esc(q.get('q') || '')}" data-filter="q" data-base="wrestlers"></div></div>
        <div class="hscroll" style="margin-bottom:28px">
          <a class="chip ${!sel ? 'on' : ''}" href="${link('promo', '')}">${t('all')}</a>
          ${promos.map((p) => `<a class="chip ${sel === p.id ? 'on' : ''}" href="${link('promo', p.id)}"><span class="sw" style="background:${p.theme.primary}"></span>${esc(p.short)}</a>`).join('')}
          <a class="chip ${champsOnly ? 'on' : ''}" href="${link('champs', champsOnly ? '' : '1')}">${t('champs.only')}</a>
        </div>
        <div class="grid-roster">${list.map((x) => rosterCard(x, { neutral: true, showPromo: true })).join('') || `<p class="muted">${t('search.none')}</p>`}</div>
      </div></section>`,
    };
  }

  // ---------------------------------------------------------------- shop (all products)
  function pageShop(params, q) {
    const promos = API.promotions();
    const sel = q.get('promo') || '', type = q.get('type') || '', avail = q.get('avail') || '', sort = q.get('sort') || 'feat';
    let list = API.products({ promotion: sel || undefined, type: type || undefined, q: q.get('q') || undefined });
    if (avail === 'stock') list = list.filter((p) => p.fulfilment === 'stock' && !isSoldOut(p));
    if (avail === 'mto') list = list.filter((p) => p.fulfilment === 'made-to-order');
    if (avail === 'pre') list = list.filter((p) => p.fulfilment === 'preorder');
    list = sortProducts(list, sort);
    const types = [...new Set(API.products().map((p) => p.type))];
    const link = (k, v) => { const n = new URLSearchParams(q); if (v) n.set(k, v); else n.delete(k); const s = n.toString(); return '#/shop' + (s ? '?' + s : ''); };
    return {
      title: t('nav.shop'), nav: 'shop',
      html: `<section class="section"><div class="wrap">
        <h1 class="h-section" style="margin-bottom:24px">${t('nav.shop')} <span class="hl">${list.length}</span></h1>
        <div class="filterbar">
          <div class="grow"><input class="search-input" type="search" placeholder="${esc(t('search.ph'))}" value="${esc(q.get('q') || '')}" data-filter="q" data-base="shop"></div>
          <label class="small muted" for="sort-sel">${t('sort')}</label>
          <select id="sort-sel" class="select-pill" data-filter="sort" data-base="shop">
            ${[['feat', 'sort.feat'], ['new', 'sort.new'], ['lo', 'sort.lo'], ['hi', 'sort.hi']].map(([v, k]) => `<option value="${v}" ${sort === v ? 'selected' : ''}>${t(k)}</option>`).join('')}
          </select>
        </div>
        <div class="hscroll" style="margin-bottom:10px">
          <a class="chip ${!sel ? 'on' : ''}" href="${link('promo', '')}">${t('all')}</a>
          ${promos.map((p) => `<a class="chip ${sel === p.id ? 'on' : ''}" href="${link('promo', p.id)}"><span class="sw" style="background:${p.theme.primary}"></span>${esc(p.short)}</a>`).join('')}
        </div>
        <div class="hscroll" style="margin-bottom:10px">
          <a class="chip ${!type ? 'on' : ''}" href="${link('type', '')}">${t('type')}: ${t('all')}</a>
          ${types.map((ty) => `<a class="chip ${type === ty ? 'on' : ''}" href="${link('type', ty)}">${TYPE_LABEL[ty] || ty}</a>`).join('')}
        </div>
        <div class="hscroll" style="margin-bottom:28px">
          <a class="chip ${!avail ? 'on' : ''}" href="${link('avail', '')}">${t('avail')}: ${t('all')}</a>
          <a class="chip ${avail === 'stock' ? 'on' : ''}" href="${link('avail', 'stock')}">${t('in.stock')}</a>
          <a class="chip ${avail === 'mto' ? 'on' : ''}" href="${link('avail', 'mto')}">${t('mto')}</a>
          <a class="chip ${avail === 'pre' ? 'on' : ''}" href="${link('avail', 'pre')}">${t('pre')}</a>
        </div>
        <div class="grid-products">${list.map((p) => productCard(p, { neutral: true })).join('') || `<p class="muted">${t('search.none')}</p>`}</div>
      </div></section>`,
    };
  }

  // ---------------------------------------------------------------- promotion page
  function pagePromotion({ promo: pid }, q) {
    const promo = API.promotion(pid);
    if (!promo) return pageNotFound();
    const roster = API.talentFor(pid);
    const teams = API.teamsFor(pid);
    const filter = q.get('f') || 'all';
    let list = roster;
    if (filter === 'champs') list = roster.filter((x) => x.title);
    if (filter === 'teams') list = roster.filter((x) => x.team);
    const merch = sortProducts(API.products({ store: pid }), 'feat');
    const teamMerch = API.products({ promotion: pid }).filter((p) => API.team(p.store));
    const champs = (promo.championships || []).map((c) => champCard(promo, c)).join('');
    const [w1, ...wr] = promo.short.split(' ');
    return {
      title: `${promo.name} | ${API.platform().name}`, theme: promo, nav: 'promotions',
      html: `
      <section class="p-hero">
        ${promo.texture ? `<div class="bg" style="background-image:url('${esc(promo.texture)}')"></div>` : ''}
        ${promo.hero ? `<div class="bg-photo" style="background-image:url('${esc(promo.hero)}')"></div>` : ''}
        <div class="wrap">
          <img class="logo ${promo.logoOnLight ? 'on-light' : ''}" src="${esc(promo.logo)}" alt="${esc(promo.name)} logo">
          <div class="label">${flag(promo.countryCode)} ${esc(promo.city ? promo.city + ', ' : '')}${esc(promo.country)} · ${t('official')}</div>
          <h1 class="display" style="margin-top:12px">${esc(promo.name)}</h1>
          <div class="slash"></div>
          <p class="lede" style="color:#d6d3cb">${esc(promo.tagline || '')}</p>
          <div class="socials">${socialsHTML({ website: promo.website, ...promo.socials })}</div>
          <div class="stats">
            <div class="stat"><b>${roster.length}</b><span>${t('wrestlers')}</span></div>
            <div class="stat"><b>${API.products({ promotion: pid }).length}</b><span>${t('products')}</span></div>
            <div class="stat"><b>${(promo.championships || []).length}</b><span>${t('titles')}</span></div>
          </div>
        </div>
      </section>

      ${champs ? `<section class="section tight"><div class="wrap"><div class="section-head"><h2 class="h-section"><span class="hl">${esc(promo.short)}</span> ${t('champions')}</h2></div><div class="champ-strip">${champs}</div></div></section>` : ''}

      <section class="section tight" id="roster"><div class="wrap">
        <div class="section-head">
          <h2 class="h-section"><span class="hl">${esc(w1)}</span>${wr.length ? ' ' + esc(wr.join(' ')) : ''} ${t('roster')}</h2>
          <div class="chips">
            <a class="chip ${filter === 'all' ? 'on' : ''}" href="#/p/${pid}">${t('all')} (${roster.length})</a>
            ${roster.some((x) => x.title) ? `<a class="chip ${filter === 'champs' ? 'on' : ''}" href="#/p/${pid}?f=champs">${t('champions')}</a>` : ''}
            ${teams.length ? `<a class="chip ${filter === 'teams' ? 'on' : ''}" href="#/p/${pid}?f=teams">${t('teams')}</a>` : ''}
          </div>
        </div>
        <div class="grid-roster">${list.map((x) => rosterCard(x, { context: pid })).join('')}</div>
      </div></section>

      ${teams.length ? `<section class="section tight"><div class="wrap"><div class="section-head"><h2 class="h-section">${t('teams')}</h2></div>
        <div class="grid-promos" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${teams.map(teamCard).join('')}</div></div></section>` : ''}

      <section class="section tight" id="merch"><div class="wrap">
        <div class="section-head"><h2 class="h-section">${t('merch.of', { x: `<span class="hl">${esc(promo.short)}</span>` })}</h2></div>
        <div class="grid-products">${[...merch, ...teamMerch].map((p) => productCard(p)).join('')}</div>
      </div></section>`,
    };
  }

  // ---------------------------------------------------------------- wrestler / team store
  function pageStore({ promo: pid, slug }) {
    const promo = API.promotion(pid);
    const key = `${pid}/${slug}`;
    const tl = API.talent(key);
    const team = API.team(key);
    if (!promo || (!tl && !team)) return pageNotFound();
    const own = sortProducts(API.products({ store: key }), 'feat');
    const roster = API.homeTalentFor(pid).filter((x) => x.key !== key);
    let hero;
    if (tl) {
      const tm = API.teamOf(key);
      const settings = tl.storeSettings || {};
      hero = `<div class="frame" style="--frame:var(--accent)">
          ${tl.title ? `<span class="belt">${I.belt}${t('champions').replace(/s$/, '')}</span>` : ''}
          <div class="frame-media"><img src="${esc(tl.photo)}" alt="${esc(tl.name)}"></div></div>
        <div>
          <div class="official"><img src="${esc(promo.logo)}" alt="${esc(promo.short)}"><span class="label">${t('official')}</span></div>
          ${tl.nickname ? `<div class="nick">${esc(tl.nickname)}</div>` : ''}
          <h1 class="display">${esc(tl.name)}</h1>
          ${tl.title ? `<div class="title-pill">${I.belt}${esc(tl.title)}</div>` : ''}
          ${tm || (tl.appearsIn || []).length ? `<div class="chips" style="margin-top:14px">${tm ? `<a class="chip" href="#/p/${tm.promotion}/${tm.id}">${esc(tm.name)} →</a>` : ''}${(tl.appearsIn || []).map((x) => { const pr = API.promotion(x); return `<a class="chip" href="#/p/${x}"><img src="${esc(pr.logo)}" alt="">Also wrestles for ${esc(pr.short)}</a>`; }).join('')}</div>` : ''}
          ${settings.bio ? `<p class="lede" style="color:#d6d3cb">${esc(settings.bio)}</p>` : ''}
          <div class="socials">${socialsHTML(tl.socials)}</div>
          <div class="hero-ctas"><a class="btn btn-primary" href="#shop-grid" data-act="scroll" data-to="shop-grid">${t('shop.coll')} (${own.length})</a><button class="btn btn-ghost" data-act="copy-link">${I.link} ${t('share')}</button></div>
          <div class="share-note">${I.heart}<span>${t('share.note', { x: esc(tl.name) })}</span></div>
        </div>`;
    } else {
      const mem = team.members.map((k) => API.talent(k)).filter(Boolean);
      hero = `<div class="frame" style="--frame:var(--accent)"><div class="frame-media" style="display:grid;grid-template-columns:repeat(${mem.length},1fr)">${mem.map((m) => `<img src="${esc(m.photo)}" alt="${esc(m.name)}" style="position:static">`).join('')}</div></div>
        <div>
          <div class="official"><img src="${esc(promo.logo)}" alt="${esc(promo.short)}"><span class="label">${t('official')} · ${t('teams')}</span></div>
          <h1 class="display">${esc(team.name)}</h1>
          <div class="chips" style="margin-top:18px">${mem.map((m) => `<a class="chip" href="#/p/${m.promotion}/${m.id}">${esc(m.name)}${m.promotion !== pid ? ` · ${esc(API.promotion(m.promotion).short)}` : ''}</a>`).join('')}</div>
          <div class="hero-ctas"><a class="btn btn-primary" href="#shop-grid" data-act="scroll" data-to="shop-grid">${t('shop.coll')} (${own.length})</a><button class="btn btn-ghost" data-act="copy-link">${I.link} ${t('share')}</button></div>
          <div class="share-note">${I.heart}<span>${t('share.note', { x: esc(team.name) })}</span></div>
        </div>`;
    }
    const teamGear = tl ? API.products({ talent: key }).filter((p) => p.store !== key && API.team(p.store)) : [];
    const memberGear = team ? team.members.flatMap((k) => API.products({ store: k }).slice(0, 2)) : [];
    return {
      title: `${(tl || team).name} | ${promo.short} | ${API.platform().name}`, theme: promo,
      html: `
      <section class="s-hero">
        ${promo.texture ? `<div class="bg" style="background-image:url('${esc(promo.texture)}')"></div>` : ''}
        <div class="wrap">${hero}</div>
      </section>
      <div class="wrap"><nav class="crumbs"><a href="#/">${t('home')}</a>/<a href="#/p/${pid}">${esc(promo.short)}</a>/<span>${esc((tl || team).name)}</span></nav></div>
      <section class="section tight" id="shop-grid" style="padding-top:8px"><div class="wrap">
        <div class="grid-products">${own.map((p) => productCard(p)).join('')}</div>
      </div></section>
      ${teamGear.length ? `<section class="section tight"><div class="wrap"><div class="section-head"><h2 class="h-section">${t('team.gear')}</h2></div><div class="grid-products">${teamGear.map((p) => productCard(p)).join('')}</div></div></section>` : ''}
      ${memberGear.length ? `<section class="section tight"><div class="wrap"><div class="section-head"><h2 class="h-section">${t('nav.wrestlers')}</h2></div><div class="grid-products">${memberGear.map((p) => productCard(p)).join('')}</div></div></section>` : ''}
      <section class="section tight"><div class="wrap">
        <div class="section-head"><h2 class="h-section">${t('more.from', { x: `<span class="hl">${esc(promo.short)}</span>` })}</h2><a class="link-arrow" href="#/p/${pid}">${t('see.all')}</a></div>
        <div class="grid-roster">${roster.slice(0, 4).map((x) => rosterCard(x)).join('')}</div>
      </div></section>`,
    };
  }

  // ---------------------------------------------------------------- product page
  const PDP = {};
  function pageProduct({ id }) {
    const p = API.product(id);
    if (!p) return pageNotFound();
    const promo = API.promotion(p.promotion);
    const s = API.storeInfo(p.store);
    if (PDP.id !== id) { PDP.id = id; PDP.color = p.colors[0] && p.colors[0].name; PDP.size = null; PDP.option = p.options ? p.options[0] : null; PDP.qty = 1; PDP.view = 0; }
    const more = API.products({ store: p.store }).filter((x) => x.id !== p.id).slice(0, 4);
    const morePromo = API.products({ promotion: p.promotion }).filter((x) => x.store !== p.store).slice(0, 4);
    return {
      title: `${p.title} | ${s.name} | ${API.platform().name}`, theme: promo,
      html: `<div class="wrap">
        <nav class="crumbs"><a href="#/">${t('home')}</a>/<a href="#/p/${promo.id}">${esc(promo.short)}</a>${s.kind !== 'promotion' ? `/<a href="${s.href}">${esc(s.name)}</a>` : ''}/<span>${esc(p.title)}</span></nav>
        <div class="pdp" id="pdp">${pdpInner(p)}</div>
      </div>
      ${more.length ? `<section class="section tight"><div class="wrap"><div class="section-head"><h2 class="h-section">${t('more.from', { x: `<span class="hl">${esc(s.name)}</span>` })}</h2><a class="link-arrow" href="${s.href}">${t('see.all')}</a></div><div class="grid-products">${more.map((x) => productCard(x)).join('')}</div></div></section>` : ''}
      ${morePromo.length ? `<section class="section tight"><div class="wrap"><div class="section-head"><h2 class="h-section">${t('more.from', { x: `<span class="hl">${esc(promo.short)}</span>` })}</h2><a class="link-arrow" href="#/p/${promo.id}">${t('see.all')}</a></div><div class="grid-products">${morePromo.map((x) => productCard(x)).join('')}</div></div></section>` : ''}`,
      after: () => bindGallery(),
    };
  }

  function currentVariant(p) {
    return p.variants.find((v) => (!v.color || v.color === PDP.color) && (!v.size || v.size === PDP.size) && (!v.option || v.option === PDP.option));
  }

  function pdpInner(p) {
    const promo = API.promotion(p.promotion);
    const s = API.storeInfo(p.store);
    const views = Art.views(p);
    const col = p.colors.find((c) => c.name === PDP.color);
    const hex = col && col.hex;
    const sizes = [...new Set(p.variants.map((v) => v.size).filter(Boolean))];
    const needsSize = sizes.length > 0;
    const v = currentVariant(p);
    const soldOut = isSoldOut(p);
    const vOut = v && v.stock === 0;
    const canAdd = !soldOut && (!needsSize || (PDP.size && !vOut));
    const ship = API.quoteShipping(S.country);
    const share = API.platform().revenueShare;
    const profit = Math.max(0, p.price - p.baseCost);
    const fee = p.price * 0.04;
    const split = [
      ['Blank, print & packing', p.baseCost, '#6b6962'],
      ['Payment fees', fee, '#4a4945'],
      [s.kind === 'promotion' ? promo.short : s.name, (profit - fee) * share.talent, 'var(--accent)'],
      [promo.short + (s.kind === 'promotion' ? ' (extra)' : ''), (profit - fee) * share.promotion, 'var(--brand)'],
      ['Maker & platform', (profit - fee) * share.maker, '#9b988f'],
    ];
    let fulfil;
    if (p.fulfilment === 'preorder') fulfil = [I.clock, t('f.pre'), t('f.pre.d', { d: dateFmt(p.shipsBy) })];
    else if (p.fulfilment === 'made-to-order') fulfil = [I.print, t('f.mto'), t('f.mto.d')];
    else fulfil = [I.box, soldOut ? t('sold') : t('f.stock'), soldOut ? '' : t('f.stock.d')];
    const sizeBtns = sizes.map((sz) => {
      const vv = p.variants.find((x) => x.size === sz && (!x.color || x.color === PDP.color) && (!x.option || x.option === PDP.option));
      const out = vv && vv.stock === 0;
      const few = vv && vv.stock > 0 && vv.stock <= 4;
      return `<button class="size ${PDP.size === sz ? 'on' : ''} ${out ? 'out' : ''}" data-act="size" data-v="${sz}" ${out ? 'aria-disabled="true"' : ''}>${sz}${few ? `<span class="few">${vv.stock}</span>` : ''}</button>`;
    }).join('');
    return `
      <div class="gallery">
        <div class="gallery-main" id="gal">${views.map((vw, i) => `<div class="slide" data-i="${i}">${vw.kind === 'img' ? `<img src="${esc(vw.src)}" alt="${esc(p.title)} ${esc(vw.label)}">` : Art.render(p, artCtx(p), { view: vw.view, color: hex })}</div>`).join('')}</div>
        ${views.length > 1 ? `<div class="gallery-thumbs">${views.map((vw, i) => `<button class="${i === PDP.view ? 'on' : ''}" data-act="view" data-i="${i}" aria-label="${esc(vw.label)}">${vw.kind === 'img' ? `<img src="${esc(vw.src)}" alt="">` : Art.render(p, artCtx(p), { view: vw.view, color: hex })}<span class="lbl">${esc(vw.label)}</span></button>`).join('')}</div><div class="gallery-hint">Swipe or tap for another view.</div>` : ''}
      </div>
      <div>
        <a class="store-chip" href="${s.href}"><img class="av ${s.logo ? 'logo' : ''}" src="${esc(s.photo)}" alt=""><span><small>${t('sold.by')}</small><b>${esc(s.name)}</b></span><img src="${esc(promo.logo)}" alt="${esc(promo.short)}" style="height:18px;width:auto;margin-left:6px"></a>
        <h1 class="display">${esc(p.title)}</h1>
        <div class="price">${money(p.price)}${S.currency !== 'USD' ? `<small>≈ ${money(p.price, 'USD')} USD</small>` : ''}</div>
        <div class="chips" style="margin-top:12px">${badgeFor(p)}${p.fulfilment === 'made-to-order' ? `<span class="badge mto">${t('mto')}</span>` : ''}${p.limited ? `<span class="badge">${t('limited', { n: p.limited })}</span>` : ''}</div>
        ${p.colors.length > 1 ? `<div class="opt"><div class="opt-head"><span class="label">${t('colour')}: ${esc(PDP.color)}</span></div><div class="swatches">${p.colors.map((c) => `<button class="swatch ${c.name === PDP.color ? 'on' : ''}" style="background-color:${c.hex}" data-act="color" data-v="${esc(c.name)}" aria-label="${esc(c.name)}"></button>`).join('')}</div></div>` : ''}
        ${p.options ? `<div class="opt"><div class="opt-head"><span class="label">${t('design')}</span></div><div class="chips">${p.options.map((o) => `<button class="chip ${o === PDP.option ? 'on' : ''}" data-act="option" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>` : ''}
        ${needsSize ? `<div class="opt"><div class="opt-head"><span class="label">${t('size')}${PDP.size ? ': ' + PDP.size : ''}</span><a href="#/help#sizes" class="small muted" style="text-decoration:underline">${t('size.guide')}</a></div><div class="sizes">${sizeBtns}</div>
          ${v && v.stock > 0 && v.stock <= 4 ? `<div class="small" style="color:var(--warn);margin-top:8px">${t('left', { n: v.stock })}</div>` : ''}</div>` : ''}
        <div class="buy-row">
          <div class="qty"><button data-act="pqty" data-d="-1" aria-label="Less">−</button><span>${PDP.qty}</span><button data-act="pqty" data-d="1" aria-label="More">+</button></div>
          ${soldOut || vOut ? `<button class="btn btn-ghost" data-act="notify">${t('notify')}</button>` : `<button class="btn btn-primary" data-act="add" ${canAdd ? '' : 'data-need="size"'}>${needsSize && !PDP.size ? t('pick.size') : t('add')} · ${money(p.price * PDP.qty)}</button>`}
        </div>
        <div class="fulfil">${fulfil[0]}<div><b>${fulfil[1]}</b><span class="muted">${fulfil[2]}</span></div></div>
        <div class="ship-est">${I.globe.replace('<svg', '<svg width="16" height="16"')}<span>${t('ship.to')}</span>
          <select data-act="country" aria-label="${t('co.country')}">${COUNTRIES.map(([c, n]) => `<option value="${c}" ${c === S.country ? 'selected' : ''}>${flag(c)} ${esc(n)}</option>`).join('')}</select>
          <span>${t('ship.est', { p: money(ship.price), d: ship.days })}</span></div>
        ${p.sample ? `<div class="sample-note">${t('sample')}</div>` : ''}
        <div class="acc">
          <details open><summary>${t('details')}</summary><div class="acc-body"><p>${esc(p.description)}</p>
            ${['tee', 'hoodie', 'tank'].includes(p.type) ? `<p class="muted">${p.type === 'hoodie' ? '100% cotton fleece, 330 gsm.' : '100% combed cotton, 220 gsm.'} Made in ${esc(API.platform().madeIn)}.</p>` : ''}
            ${p.variants[0] ? `<p class="muted small">SKU ${esc((v || p.variants[0]).sku)}</p>` : ''}</div></details>
          <details><summary>${t('ship.ret')}</summary><div class="acc-body"><p>Ships from ${esc(API.platform().madeIn)}. To ${esc(CNAME[S.country] || S.country)}: ${money(API.quoteShipping(S.country).price)} standard (${esc(ship.days)}), ${money(API.quoteShipping(S.country, 'express').price)} express (${esc(API.quoteShipping(S.country, 'express').days)}).</p><p>Misprints and damaged items are replaced free. One free size exchange within 14 days on clothing. <a href="#/help#returns" style="text-decoration:underline">Full policy</a>.</p></div></details>
          <details><summary>${t('money')}</summary><div class="acc-body">
            <p>Of every ${money(p.price)} sale:</p>
            <div class="split">${split.map(([, v2, c]) => `<span style="flex:${Math.max(v2, 0.01)};background:${c}"></span>`).join('')}</div>
            <div class="split-legend">${split.map(([l, v2, c]) => `<span><i style="background:${c}"></i>${esc(l)} ${money(v2)}</span>`).join('')}</div>
            <p class="muted small" style="margin-top:10px">Sample split for the mock-up. The real split is agreed with each wrestler and promotion.</p></div></details>
        </div>
      </div>`;
  }
  function rerenderPDP() {
    const p = API.product(PDP.id);
    const el = $('#pdp');
    if (!p || !el) return;
    el.innerHTML = pdpInner(p);
    bindGallery();
  }
  function bindGallery() {
    const g = $('#gal');
    if (!g) return;
    g.scrollLeft = g.clientWidth * PDP.view;
    let tmr;
    g.addEventListener('scroll', () => {
      clearTimeout(tmr);
      tmr = setTimeout(() => {
        const i = Math.round(g.scrollLeft / g.clientWidth);
        if (i !== PDP.view) { PDP.view = i; $$('.gallery-thumbs button').forEach((b, j) => b.classList.toggle('on', j === i)); }
      }, 80);
    }, { passive: true });
  }

  // ---------------------------------------------------------------- checkout
  const CO = {};
  function pageCheckout({ store: key }) {
    const s = API.storeInfo(key);
    if (!s) return pageNotFound();
    if (CO.key !== key) { CO.key = key; CO.method = 'standard'; CO.pay = 'card'; }
    return { title: `${t('co.title')} · ${s.name}`, theme: s.promo, html: `<div class="wrap section tight" id="co">${checkoutInner(key)}</div>` };
  }
  function checkoutInner(key) {
    const s = API.storeInfo(key);
    const items = bagItems(key);
    if (!items.length) return `<div class="empty">${I.bag}<p>${t('co.empty')}</p><a class="btn btn-ghost" href="${s.href}">${t('co.back')}</a></div>`;
    const sub = bagSubtotal(items);
    const std = API.quoteShipping(S.country, 'standard');
    const exp = API.quoteShipping(S.country, 'express');
    const shipCost = CO.method === 'express' ? exp.price : std.price;
    const local = PAY_LOCAL[S.country] || [];
    const pays = [['card', t('co.card')], ['apple', 'Apple Pay'], ['google', 'Google Pay'], ['paypal', 'PayPal'], ...local.map((l) => ['local:' + l, l, true])];
    const anyPre = items.some((i) => API.product(i.pid)?.fulfilment === 'preorder');
    const anyMto = items.some((i) => API.product(i.pid)?.fulfilment === 'made-to-order');
    const f = CO.form || {};
    return `
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:22px"><h1 class="h-section">${t('co.title')}</h1><span class="demo-pill">Demo</span></div>
      <div class="co">
        <form data-form="checkout" autocomplete="on">
          <div class="co-step"><h2><span class="n">1</span>${t('co.contact')}</h2><div class="fields"><div class="field full"><label for="f-email">${t('co.email')}</label><input id="f-email" name="email" type="email" required value="${esc(f.email || '')}" placeholder="fan@example.com"></div></div></div>
          <div class="co-step"><h2><span class="n">2</span>${t('co.ship')}</h2><div class="fields">
            <div class="field full"><label for="f-name">${t('co.name')}</label><input id="f-name" name="name" required value="${esc(f.name || '')}"></div>
            <div class="field full"><label for="f-country">${t('co.country')}</label><select id="f-country" name="country" data-act="country">${COUNTRIES.map(([c, n]) => `<option value="${c}" ${c === S.country ? 'selected' : ''}>${flag(c)} ${esc(n)}</option>`).join('')}</select></div>
            <div class="field full"><label for="f-addr">${t('co.addr')}</label><input id="f-addr" name="addr" required value="${esc(f.addr || '')}"></div>
            <div class="field"><label for="f-city">${t('co.city')}</label><input id="f-city" name="city" required value="${esc(f.city || '')}"></div>
            <div class="field"><label for="f-zip">${t('co.zip')}</label><input id="f-zip" name="zip" value="${esc(f.zip || '')}"></div>
            <div class="field full"><label for="f-phone">${t('co.phone')}</label><input id="f-phone" name="phone" type="tel" value="${esc(f.phone || '')}"></div>
          </div></div>
          <div class="co-step"><h2><span class="n">3</span>${t('co.method')}</h2>
            <div class="radio-list">
              <label class="radio"><input type="radio" name="method" value="standard" data-act="method" ${CO.method === 'standard' ? 'checked' : ''}><span class="grow">${t('co.std')}<small>${esc(std.zone)} · ${esc(std.days)}</small></span><b>${money(std.price)}</b></label>
              <label class="radio"><input type="radio" name="method" value="express" data-act="method" ${CO.method === 'express' ? 'checked' : ''}><span class="grow">${t('co.exp')}<small>${esc(exp.zone)} · ${esc(exp.days)}</small></span><b>${money(exp.price)}</b></label>
            </div>
            ${anyMto ? `<p class="small muted" style="margin:12px 0 0">${t('f.mto.d')}</p>` : ''}
            ${anyPre ? `<p class="small muted" style="margin:6px 0 0">${t('pre')}: ${items.filter((i) => API.product(i.pid)?.fulfilment === 'preorder').map((i) => `${esc(API.product(i.pid).title)} ships by ${dateFmt(API.product(i.pid).shipsBy)}`).join('; ')}.</p>` : ''}
          </div>
          <div class="co-step"><h2><span class="n">4</span>${t('co.pay')}</h2>
            <div class="pay-grid">${pays.map(([v, l, isLocal]) => `<label class="radio"><input type="radio" name="pay" value="${esc(v)}" data-act="pay" ${CO.pay === v ? 'checked' : ''}><span>${esc(l)}${isLocal ? `<span class="local-tag">${t('co.local')}</span>` : ''}</span></label>`).join('')}</div>
            ${CO.pay === 'card' ? `<div class="fields" style="margin-top:12px"><div class="field full"><label>Card number</label><input disabled placeholder="Demo: no card needed"></div></div>` : ''}
            <p class="small muted" style="margin:12px 0 0">Payment options follow the delivery country. ${local.length ? `Showing local options for ${esc(CNAME[S.country])}.` : ''}</p>
          </div>
          <button class="btn btn-primary btn-block" style="padding:18px">${t('co.place')} · ${money(sub + shipCost)}</button>
          <p class="small muted" style="text-align:center;margin-top:10px">${t('co.demo')}</p>
        </form>
        <aside class="summary" style="--b:${s.promo.theme.primary}">
          <div class="bag-head"><img class="av ${s.logo ? 'logo' : ''}" src="${esc(s.photo)}" alt=""><div><b>${esc(s.name)}</b><small>${esc(t('store.of', { x: s.promo.short }))}</small></div><img class="pl" src="${esc(s.promo.logo)}" alt=""></div>
          ${items.map((i) => { const p = API.product(i.pid); const v = (API.variant(i.sku) || {}).variant || {}; const c = p.colors.find((x) => x.name === v.color); return `<div class="line-item"><div class="thumb">${productVisual(p, { color: c && c.hex })}</div><div><div class="t">${esc(p.title)}</div><div class="v">${esc(variantLabel(v))} × ${i.qty}</div></div><div class="p">${money(p.price * i.qty)}</div></div>`; }).join('')}
          <div class="rows">
            <div class="row"><span>${t('subtotal')}</span><span>${money(sub)}</span></div>
            <div class="row"><span>${t('co.shipping')} (${flag(S.country)} ${CO.method === 'express' ? t('co.exp') : t('co.std')})</span><span>${money(shipCost)}</span></div>
            <div class="row total"><span>${t('co.total')}</span><span>${money(sub + shipCost)}</span></div>
            <p class="small muted" style="margin:4px 0 0">${t('co.charged', { c: S.currency })} ${t('co.duties')}</p>
          </div>
        </aside>
      </div>`;
  }
  function rerenderCheckout() {
    const form = $('form[data-form="checkout"]');
    if (form) CO.form = Object.fromEntries(new FormData(form));
    const el = $('#co');
    if (el) el.innerHTML = checkoutInner(CO.key);
  }
  async function placeOrder(form) {
    const data = Object.fromEntries(new FormData(form));
    const key = CO.key;
    const items = bagItems(key).map((i) => ({ ...i, price: API.product(i.pid).price }));
    const sub = bagSubtotal(bagItems(key));
    const ship = API.quoteShipping(S.country, CO.method);
    const { orderId } = await API.createCheckout(key, {
      items, currency: S.currency, country: S.country, shipping: { method: CO.method, ...ship },
      payment: CO.pay, contact: { email: data.email, name: data.name }, address: { addr: data.addr, city: data.city, zip: data.zip },
      totals: { subtotal: sub, shipping: ship.price, total: sub + ship.price },
    });
    delete S.bags[key];
    saveBags();
    CO.form = null;
    go(`#/order/${orderId}`);
  }

  // ---------------------------------------------------------------- order
  function pageOrder({ id }) {
    const o = API.order(id);
    if (!o) return { title: t('find.t'), html: `<div class="wrap section"><div class="empty"><p>${t('find.none')}</p><a class="btn btn-ghost" href="#/orders">${t('find.t')}</a></div></div>` };
    const s = API.storeInfo(o.store);
    const placed = new Date(o.placed);
    const day = (n) => { const d = new Date(placed); d.setDate(d.getDate() + n); return d.toLocaleDateString(S.lang === 'vi' ? 'vi-VN' : 'en-GB', { day: 'numeric', month: 'short' }); };
    const hasMto = o.items.some((i) => API.product(i.pid)?.fulfilment === 'made-to-order');
    const days = String(o.shipping.days || '').match(/\d+/g) || [5, 10];
    const steps = [
      [t('o.placed'), placed.toLocaleString(S.lang === 'vi' ? 'vi-VN' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), 'done'],
      [hasMto ? t('o.print') : t('o.pack'), `${hasMto ? 'Ho Chi Minh City' : ''} · ${day(1)}–${day(hasMto ? 4 : 2)}`, 'now'],
      [t('o.shipped'), `${o.shipping.zone} · ${day(hasMto ? 5 : 2)}`, ''],
      [t('o.deliv'), `${day((hasMto ? 5 : 2) + +days[0])}–${day((hasMto ? 5 : 2) + +(days[1] || days[0]))}`, ''],
    ];
    return {
      title: `${t('o.thanks')} ${o.id}`, theme: s.promo,
      html: `<div class="wrap section tight" style="max-width:820px">
        <div class="label">${t('o.num')} <b style="color:var(--text)">${esc(o.id)}</b> · <span class="demo-pill">Demo</span></div>
        <h1 class="h-section" style="margin:10px 0">${t('o.thanks')}</h1>
        <p class="lede">${t('o.sub', { x: esc((o.contact.name || '').split(' ')[0] || ''), e: esc(o.contact.email || '') })}</p>
        <div class="timeline">${steps.map(([a, b, st]) => `<div class="tl ${st}"><div class="dot">${st === 'done' ? I.check : ''}</div><div><b>${esc(a)}</b><small>${esc(b)}</small></div></div>`).join('')}</div>
        <div class="summary" style="position:static">
          <div class="bag-head"><img class="av ${s.logo ? 'logo' : ''}" src="${esc(s.photo)}" alt=""><div><b>${esc(s.name)}</b><small>${esc(t('store.of', { x: s.promo.short }))}</small></div><img class="pl" src="${esc(s.promo.logo)}" alt=""></div>
          ${o.items.map((i) => { const p = API.product(i.pid); if (!p) return ''; const v = (API.variant(i.sku) || {}).variant || {}; const c = p.colors.find((x) => x.name === v.color); return `<div class="line-item"><div class="thumb">${productVisual(p, { color: c && c.hex })}</div><div><div class="t">${esc(p.title)}</div><div class="v">${esc(variantLabel(v))} × ${i.qty}</div></div><div class="p">${money(i.price * i.qty, o.currency)}</div></div>`; }).join('')}
          <div class="rows">
            <div class="row"><span>${t('subtotal')}</span><span>${money(o.totals.subtotal, o.currency)}</span></div>
            <div class="row"><span>${t('co.shipping')} · ${flag(o.country)} ${esc(CNAME[o.country] || o.country)}</span><span>${money(o.totals.shipping, o.currency)}</span></div>
            <div class="row total"><span>${t('co.total')}</span><span>${money(o.totals.total, o.currency)}</span></div>
          </div>
        </div>
        <div class="hero-ctas"><a class="btn btn-primary" href="${s.href}">${t('co.back')}</a><a class="btn btn-ghost" href="#/orders">${t('find.t')}</a></div>
      </div>`,
    };
  }

  function pageFindOrder() {
    const recent = API.orders();
    return {
      title: t('find.t'),
      html: `<div class="wrap section" style="max-width:720px">
        <h1 class="h-section">${t('find.t')}</h1><p class="lede">${t('find.d')}</p>
        <form data-form="find" class="co-step" style="margin-top:24px"><div class="fields">
          <div class="field"><label for="fo-id">${t('o.num')}</label><input id="fo-id" name="id" required placeholder="HT-XXXXXX"></div>
          <div class="field"><label for="fo-email">${t('co.email')}</label><input id="fo-email" name="email" type="email" required></div>
        </div><button class="btn btn-primary" style="margin-top:14px">${t('find.go')}</button><p class="small" id="find-msg" style="color:var(--bad);margin:10px 0 0"></p></form>
        ${recent.length ? `<h2 class="label" style="margin-top:32px">${t('find.recent')}</h2><div class="tbl-wrap" style="margin-top:10px"><table class="tbl"><tbody>${recent.map((o) => `<tr><td><a href="#/order/${o.id}" style="text-decoration:underline">${esc(o.id)}</a></td><td>${esc(storeLabel(o.store))}</td><td>${new Date(o.placed).toLocaleDateString()}</td><td class="num">${money(o.totals.total, o.currency)}</td></tr>`).join('')}</tbody></table></div>` : ''}
      </div>`,
    };
  }

  // ---------------------------------------------------------------- studio
  function pageStudio({ promo: pid, slug, tab }) {
    const all = API.allTalent();
    let key = pid && slug ? `${pid}/${slug}` : null;
    if (!key || !API.talent(key)) key = (all.find((x) => x.title) || all[0]).key;
    const tl = API.talent(key);
    const promo = API.promotion(tl.promotion);
    tab = tab || 'overview';
    const base = `#/studio/${tl.promotion}/${tl.id}`;
    const tabs = [['overview', 'Overview'], ['products', 'Products'], ['new', 'New design'], ['settings', 'Store settings']];
    let body = '';
    if (tab === 'products') body = studioProducts(key);
    else if (tab === 'new') body = studioNew(key);
    else if (tab === 'settings') body = studioSettings(key);
    else body = studioOverview(key);
    return {
      title: `Store manager · ${tl.name}`, theme: promo, nav: 'studio',
      html: `<div class="wrap">
        <div class="studio-top">
          <div class="studio-who"><img src="${esc(tl.photo)}" alt=""><div><div class="label">Store manager <span class="demo-pill">Demo</span></div><div class="display" style="font-size:34px">${esc(tl.name)}</div></div></div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <label class="small muted" for="as">Viewing as</label>
            <select id="as" class="select-pill" data-act="studio-as">${API.promotions().map((p) => `<optgroup label="${esc(p.short)}">${API.homeTalentFor(p.id).map((x) => `<option value="${x.promotion}/${x.id}" ${x.key === key ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</optgroup>`).join('')}</select>
            <a class="btn btn-ghost btn-sm" href="#/p/${tl.promotion}/${tl.id}">View my store</a>
          </div>
        </div>
        <nav class="tabs">${tabs.map(([k, l]) => `<a href="${base}/${k}" class="${tab === k ? 'on' : ''}">${l}</a>`).join('')}</nav>
        <div id="studio-body">${body}</div>
        <p class="small muted" style="margin:28px 0 0">This is the screen a wrestler would log in to. In the live version their sales, stock and payouts come from the manufacturer's order system; here they are generated sample numbers. Changes you make (prices, hiding products, new designs) are saved in this browser and show up in the storefront.</p>
      </div>`,
      after: () => bindChart(),
    };
  }

  function studioOverview(key) {
    const st = API.storeStats(key);
    const share = API.platform().revenueShare;
    const sales = st.days.reduce((a, d) => a + d.sales, 0);
    const units = st.days.reduce((a, d) => a + d.units, 0);
    const orders = Math.round(units * 0.72);
    const earn = sales * 0.6 * share.talent; // ~60% of a sale is profit after blank, print and fees
    const max = Math.max(...st.days.map((d) => d.sales), 1);
    const W = 600, H = 200, padL = 44, padB = 22, bw = (W - padL) / st.days.length;
    const step = niceStep(max);
    const ticks = []; for (let v = 0; v <= max + 0.001; v += step) ticks.push(v);
    const top = ticks[ticks.length - 1] || max;
    const y = (v) => (H - padB) - (v / top) * (H - padB - 8);
    const bars = st.days.map((d, i) => {
      const x = padL + i * bw + 1;
      const h = Math.max(0, (H - padB) - y(d.sales));
      const w = Math.max(2, bw - 2);
      const r = Math.min(4, w / 2, h);
      const yy = (H - padB) - h;
      const path = h > 0 ? `M${x},${H - padB} V${yy + r} Q${x},${yy} ${x + r},${yy} H${x + w - r} Q${x + w},${yy} ${x + w},${yy + r} V${H - padB} Z` : '';
      return `<path d="${path}" fill="var(--accent)" opacity="${d.event ? 1 : .55}"/><rect x="${x - 1}" y="0" width="${bw}" height="${H - padB}" fill="transparent" data-tip="${esc(dateFmt(d.date, { day: 'numeric', month: 'short' }))}|${esc(money(d.sales))}|${d.units} items${d.event ? ' · show night' : ''}"/>`;
    }).join('');
    const grid = ticks.map((v) => `<line x1="${padL}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(255,255,255,.07)"/><text x="${padL - 8}" y="${y(v) + 4}" text-anchor="end" fill="#9b988f" font-size="11">${esc(money(v))}</text>`).join('');
    const labels = st.days.filter((_, i) => i % 7 === 0).map((d) => { const i = st.days.indexOf(d); return `<text x="${padL + i * bw + bw / 2}" y="${H - 4}" text-anchor="middle" fill="#9b988f" font-size="11">${esc(dateFmt(d.date, { day: 'numeric', month: 'short' }))}</text>`; }).join('');
    return `
      <div class="kpis">
        <div class="kpi"><div class="label">Sales · 30 days</div><b>${money(sales)}</b><small class="up">▲ 18% vs previous 30</small></div>
        <div class="kpi"><div class="label">Orders</div><b>${orders}</b><small>${units} items</small></div>
        <div class="kpi"><div class="label">Your earnings</div><b>${money(earn)}</b><small>Sample ${Math.round(share.talent * 100)}% of profit</small></div>
        <div class="kpi"><div class="label">Next payout</div><b>${money(earn * 0.8)}</b><small>1 Dec · bank transfer</small></div>
      </div>
      <div class="studio-grid">
        <div class="panel"><h3>Daily sales</h3><div class="sub">Last 30 days. Darker bars are show nights, when the merch table is busiest.</div>
          <div class="chart" id="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Daily sales for the last 30 days">${grid}${bars}${labels}</svg><div class="tip" id="tip"></div></div></div>
        <div class="panel"><h3>Top products</h3><div class="sub">By items sold, 30 days</div>
          <table class="tbl"><tbody>${st.top.map(({ p, units: u }) => `<tr><td><div class="mini-thumb">${productVisual(p)}</div></td><td>${esc(p.title)}</td><td class="num">${u}</td></tr>`).join('')}</tbody></table></div>
      </div>
      <div class="panel" style="margin-top:12px"><h3>Recent orders</h3><div class="sub">Fans buying from ${new Set(st.recent.map((r) => r.country)).size} countries this week</div>
        <div class="tbl-wrap" style="border:0"><table class="tbl"><thead><tr><th>Order</th><th>Country</th><th>Item</th><th class="num">Qty</th><th class="num">Total</th><th>Status</th></tr></thead><tbody>
        ${st.recent.map((r) => `<tr><td>${esc(r.id)}</td><td>${flag(r.country)} ${esc(CNAME[r.country] || r.country)}</td><td>${esc(r.product)}</td><td class="num">${r.qty}</td><td class="num">${money(r.total)}</td><td><span class="status ${r.status === 'Delivered' ? 'ok' : r.status === 'Shipped' ? 'info' : 'warn'}">${esc(r.status)}</span></td></tr>`).join('')}
        </tbody></table></div></div>`;
  }
  function niceStep(max) {
    const raw = max / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
    const n = raw / mag;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
  }
  function bindChart() {
    const c = $('#chart'); if (!c) return;
    const tip = $('#tip');
    c.addEventListener('mousemove', (e) => {
      const r = e.target.closest('[data-tip]');
      if (!r) { tip.style.opacity = 0; return; }
      const [d, v, u] = r.dataset.tip.split('|');
      tip.innerHTML = `<b>${esc(v)}</b><br>${esc(d)} · ${esc(u)}`;
      const box = c.getBoundingClientRect();
      tip.style.left = (e.clientX - box.left) + 'px';
      tip.style.top = (e.clientY - box.top) + 'px';
      tip.style.opacity = 1;
    });
    c.addEventListener('mouseleave', () => { tip.style.opacity = 0; });
  }

  function studioProducts(key) {
    const list = API.products({ store: key, includeHidden: true });
    return `<div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Product</th><th>How it's made</th><th>Stock</th><th class="num">Price (USD)</th><th>Live</th></tr></thead><tbody>
      ${list.map((p) => {
        const review = p.status === 'review';
        const stock = p.fulfilment === 'stock'
          ? `<div class="stock-chips">${p.variants.filter((v) => !v.color || v.color === (p.colors[0] || {}).name).map((v) => `<span class="${v.stock === 0 ? 'z' : v.stock <= 4 ? 'l' : ''}">${esc(v.size || v.option || 'Qty')} ${v.stock}</span>`).join('')}</div>`
          : `<span class="muted small">${p.fulfilment === 'preorder' ? 'Ships by ' + dateFmt(p.shipsBy) : 'No stock held'}</span>`;
        return `<tr>
          <td><div class="mini-thumb">${productVisual(p)}</div></td>
          <td><a href="#/product/${p.id}" style="font-weight:600">${esc(p.title)}</a><div class="small muted">${esc(TYPE_LABEL[p.type] || p.type)}${p.colors.length ? ' · ' + p.colors.map((c) => c.name).join(', ') : ''}</div></td>
          <td>${review ? '<span class="status info">In review at the factory</span>' : p.fulfilment === 'stock' ? '<span class="status ok">Stocked</span>' : p.fulfilment === 'preorder' ? '<span class="status info">Pre-order</span>' : '<span class="status mute">Printed to order</span>'}</td>
          <td>${stock}</td>
          <td class="num"><input class="price-input" type="number" min="5" step="1" value="${p.price}" data-act="set-price" data-id="${esc(p.id)}" aria-label="Price for ${esc(p.title)}"></td>
          <td><button class="toggle ${p.hidden ? '' : 'on'}" data-act="toggle-live" data-id="${esc(p.id)}" aria-label="Show ${esc(p.title)} in store" ${review ? 'disabled title="Goes live once approved"' : ''}></button></td>
        </tr>`;
      }).join('')}
    </tbody></table></div>
    <p class="small muted" style="margin-top:10px">Change a price or switch a product off, then open the store: it updates straight away.</p>`;
  }

  const NEW = {};
  function studioNew(key) {
    const tl = API.talent(key);
    if (NEW.key !== key) Object.assign(NEW, { key, type: 'tee', style: 'photo', color: 'Black', price: 28, title: `${tl.name} New Tee`, artwork: null, fulfilment: 'made-to-order' });
    return `<div class="design-form">
      <form class="panel" data-form="design">
        <h3>Submit a new design</h3><div class="sub">The factory checks print quality and sends you a proof before it goes on sale.</div>
        <div class="fields">
          <div class="field full"><label for="nd-title">Product name</label><input id="nd-title" name="title" value="${esc(NEW.title)}" data-act="nd"></div>
          <div class="field"><label for="nd-type">Product</label><select id="nd-type" name="type" data-act="nd">${[['tee', 'Tee'], ['hoodie', 'Hoodie']].map(([v, l]) => `<option value="${v}" ${NEW.type === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div class="field"><label for="nd-color">Blank colour</label><select id="nd-color" name="color" data-act="nd">${['Black', 'White', 'Heather Grey', 'Bone'].map((c) => `<option ${NEW.color === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
          <div class="field full"><label>Artwork</label>
            <label class="drop" for="nd-file">${NEW.artwork ? 'Artwork added. Click to replace.' : 'Upload a PNG with a transparent background, or keep the photo layout below.'}</label>
            <input id="nd-file" type="file" accept="image/*" data-act="nd-file" class="sr">
          </div>
          <div class="field"><label for="nd-style">Layout without artwork</label><select id="nd-style" name="style" data-act="nd">${[['photo', 'Photo + name'], ['type', 'Name lettering']].map(([v, l]) => `<option value="${v}" ${NEW.style === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div class="field"><label for="nd-ful">How it's sold</label><select id="nd-ful" name="fulfilment" data-act="nd">${[['made-to-order', 'Printed to order'], ['stock', 'Stocked run'], ['preorder', 'Pre-order']].map(([v, l]) => `<option value="${v}" ${NEW.fulfilment === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div class="field full"><label for="nd-price">Price (USD)</label><input id="nd-price" name="price" type="number" min="10" step="1" value="${NEW.price}" data-act="nd"></div>
        </div>
        <div class="earn" id="earn">${earnHTML()}</div>
        <button class="btn btn-primary btn-block" style="margin-top:16px">Send to factory for review</button>
      </form>
      <div><div class="preview-tile" id="nd-prev">${ndPreview(key)}</div><p class="small muted" style="margin-top:8px">Live preview. ${NEW.type === 'hoodie' ? 'Hoodie' : 'Tee'} in ${esc(NEW.color)}.</p></div>
    </div>`;
  }
  const BLANK_HEX = { Black: '#141414', White: '#f1f0ec', 'Heather Grey': '#9a9ca1', Bone: '#e7dfcf' };
  function ndProduct(key) {
    const tl = API.talent(key);
    return { id: 'preview', title: NEW.title, type: NEW.type, talent: [key], store: key, promotion: tl.promotion, colors: [{ name: NEW.color, hex: BLANK_HEX[NEW.color] }], design: { style: NEW.artwork ? 'upload' : NEW.style, artwork: NEW.artwork } };
  }
  function ndPreview(key) { const p = ndProduct(key); return Art.render(p, artCtx(p), { view: 'front', color: BLANK_HEX[NEW.color] }); }
  function earnHTML() {
    const share = API.platform().revenueShare;
    const cost = NEW.type === 'hoodie' ? 21 : 9.5;
    const price = +NEW.price || 0;
    const fee = price * 0.04;
    const profit = Math.max(0, price - cost - fee);
    return `<div class="row"><span class="muted">Price</span><span>${money(price)}</span></div>
      <div class="row"><span class="muted">Blank, print & packing</span><span>−${money(cost)}</span></div>
      <div class="row"><span class="muted">Payment fees (about 4%)</span><span>−${money(fee)}</span></div>
      <div class="row you"><span>You earn per sale</span><span>${money(profit * share.talent)}</span></div>
      <div class="small muted">Sample split: ${Math.round(share.talent * 100)}% of profit to you, ${Math.round(share.promotion * 100)}% to your promotion, the rest to the maker.</div>`;
  }

  function studioSettings(key) {
    const tl = API.talent(key);
    const st = tl.storeSettings || {};
    return `<form class="panel" data-form="settings" style="max-width:760px">
      <h3>Store settings</h3><div class="sub">What fans see at the top of your store.</div>
      <div class="fields">
        <div class="field full"><label for="ss-bio">Short bio</label><textarea id="ss-bio" name="bio" placeholder="One or two lines for the top of your store.">${esc(st.bio || '')}</textarea></div>
        <div class="field full"><label for="ss-feat">Featured product</label><select id="ss-feat" name="featured"><option value="">Automatic</option>${API.products({ store: key }).map((p) => `<option value="${esc(p.id)}" ${st.featured === p.id ? 'selected' : ''}>${esc(p.title)}</option>`).join('')}</select></div>
        <div class="field"><label>Instagram</label><input value="${esc(tl.socials?.instagram || '')}" disabled></div>
        <div class="field"><label>Facebook</label><input value="${esc(tl.socials?.facebook || '')}" disabled></div>
      </div>
      <p class="small muted">Store colours come from your promotion (${esc(API.promotion(tl.promotion).short)}). Social links sync from the promotion's roster.</p>
      <button class="btn btn-primary" style="margin-top:8px">Save</button>
    </form>`;
  }

  // ---------------------------------------------------------------- platform (for the manufacturer)
  function pagePlatform() {
    const P = API.platform();
    const promos = API.promotions();
    const n = { promos: promos.length, talent: API.allTalent().length, products: API.products().length, skus: API.products().reduce((a, p) => a + p.variants.length, 0) };
    const rows = [
      ['Catalogue', 'Every page', 'API.load(), API.products()', 'GET /catalog or paged /products. Shape: data/catalog.json'],
      ['Live stock', 'Product page, bags', 'API.stock(sku)', 'GET /stock?sku=… per size/colour. null means made to order'],
      ['Shipping quotes', 'Product page, checkout', 'API.quoteShipping(country, method)', 'POST /shipping/quote. Today: 4 zones from Vietnam'],
      ['Checkout, per store', 'Checkout', 'API.createCheckout(store, payload)', 'POST /checkout → hosted payment page (e.g. Stripe) for that store'],
      ['Order lookup', 'Find your order, order page', 'API.findOrder(id, email)', 'GET /orders/:id?email=…'],
      ['Store stats & payouts', 'Store manager › Overview', 'API.storeStats(store)', 'GET /stores/:key/stats'],
      ['Product edits', 'Store manager › Products', 'API.updateProduct(id, {price, hidden})', 'PATCH /products/:id'],
      ['Design submission', 'Store manager › New design', 'API.submitDesign(spec)', 'POST /stores/:key/designs (artwork file + blank + price)'],
      ['Store profile', 'Store manager › Settings', 'API.saveStoreSettings(store, s)', 'PATCH /stores/:key'],
    ];
    return {
      title: 'How it connects', nav: 'platform',
      html: `<section class="section"><div class="wrap">
        <div class="label">For manufacturing partners</div>
        <h1 class="h-section" style="margin-top:8px;max-width:18ch">How this storefront plugs into your order system</h1>
        <p class="lede">${esc(P.name)} is only the shop window. Every product, price, stock count, order and payout it shows goes through one file, <code class="inline">assets/js/api.js</code>. Point those functions at your system and the same pages run on your data. Nothing else changes.</p>

        <div class="flow">
          <div class="node"><h4>Fans</h4><p>Browse by promotion or wrestler, pay in their currency, ship anywhere.</p><ul><li>${n.promos} promotions</li><li>${n.talent} wrestler stores</li><li>${Object.keys(P.currencies).length} currencies</li></ul></div>
          <div class="arrow">${I.arrow}</div>
          <div class="node key"><h4>${esc(P.name)} storefront</h4><p>This site. Neutral shell; each store wears its promotion's colours.</p><ul><li>Bags split per store</li><li>Store manager for talent</li><li>api.js is the only data seam</li></ul></div>
          <div class="arrow">${I.arrow}</div>
          <div class="node kot"><h4>Your order system</h4><p>What we'd call, replacing the sample data:</p><ul><li>Products, sizes, stock</li><li>Checkout & payments per store</li><li>Printing, packing, shipping</li><li>Sales & payouts per store</li></ul></div>
        </div>

        <div class="section-head" style="margin-top:56px"><h2 class="h-section">What each screen needs</h2></div>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Capability</th><th>Used on</th><th>Function in api.js</th><th>Suggested call to your system</th></tr></thead>
        <tbody>${rows.map((r) => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td><code class="inline">${esc(r[2])}</code></td><td class="muted">${esc(r[3])}</td></tr>`).join('')}</tbody></table></div>

        <div class="section-head" style="margin-top:56px"><div><h2 class="h-section">The data model</h2><p class="lede">Today's sample: ${n.products} products, ${n.skus.toLocaleString()} SKUs. <a href="data/catalog.json" target="_blank" style="text-decoration:underline">See the JSON</a>.</p></div></div>
        <div class="model">
          <div class="entity"><h4>Promotion <span>${n.promos}</span></h4><code>id, name, short, country<br>logo, theme {primary, accent}<br>championships[]</code></div>
          <div class="entity"><h4>Wrestler <span>${n.talent}</span></h4><code>key = promotion/id<br>name, nickname, title<br>team, photo, socials</code></div>
          <div class="entity"><h4>Team / stable <span>${promos.reduce((a, p) => a + API.teamsFor(p.id).length, 0)}</span></h4><code>key, name<br>members[] → wrestlers<br>has its own store</code></div>
          <div class="entity"><h4>Store</h4><code>a wrestler, team or promotion<br>owns products<br>checks out on its own</code></div>
          <div class="entity"><h4>Product <span>${n.products}</span></h4><code>id, store, title, type, price<br>fulfilment: stock | made-to-order | preorder<br>images[] or design{}</code></div>
          <div class="entity"><h4>Variant <span>${n.skus.toLocaleString()}</span></h4><code>sku, size, color, option<br>stock (null = no limit)</code></div>
          <div class="entity"><h4>Order</h4><code>id, store, items[{sku, qty, price}]<br>currency, country, shipping<br>payment, totals, status</code></div>
        </div>

        <div class="section-head" style="margin-top:56px"><h2 class="h-section">Decisions already built in</h2></div>
        <div class="qa">
          <div><b>Separate checkout per store</b><p>Fans can fill several bags (one per wrestler or promotion). Each pays and ships on its own, matching how single-artist stores run today. A shared cart can come later if your system can split one payment across stores.</p></div>
          <div><b>Three ways to sell</b><p>Stocked (live stock, low-stock and sold-out labels), printed to order (no stock held), and pre-order (ships-by date). One product field drives the labels and delivery promises.</p></div>
          <div><b>Any currency, ships anywhere</b><p>Prices are held in USD and shown in ${Object.keys(P.currencies).length} currencies. Shipping is quoted by zone from Vietnam. Payment options change with the delivery country (MoMo in Vietnam, GCash in the Philippines, PayNow in Singapore…).</p></div>
          <div><b>Promotion themes</b><p>Platform pages are neutral. Promotion, wrestler, product and checkout pages take that promotion's colours and logo automatically from two hex values.</p></div>
          <div><b>Talent self-service</b><p>Wrestlers see sales and payouts, change prices, switch products on and off, and submit new designs, which go to the factory for review before going live.</p></div>
          <div><b>Real and sample products together</b><p>Real merch uses product photos. Where a wrestler has no merch yet, sample designs are drawn from their photo so every store has something to show.</p></div>
        </div>

        <div class="section-head" style="margin-top:56px"><h2 class="h-section">Questions for you</h2></div>
        <div class="qa">
          <div><b>What can your system share?</b><p>Products, variants, stock, orders and payouts: through an API, a feed, or exports?</p></div>
          <div><b>Who hosts the storefront?</b><p>This site calling your API, or your platform rebuilding these screens with this as the design?</p></div>
          <div><b>Checkout & payments</b><p>Which payment provider, which currencies you can settle in, and which local wallets you support.</p></div>
          <div><b>Shipping</b><p>Real zone rates, carriers and delivery times from Vietnam.</p></div>
          <div><b>Revenue split & payouts</b><p>How wrestlers and promotions get paid, and how often.</p></div>
          <div><b>Design approval</b><p>Artwork specs, proofing, and how long from design to on sale.</p></div>
        </div>
      </div></section>`,
    };
  }

  // ---------------------------------------------------------------- help
  function pageHelp() {
    const P = API.platform();
    return {
      title: t('nav.help'),
      html: `<section class="section"><div class="wrap" style="max-width:900px">
        <h1 class="h-section">${t('nav.help')}</h1>
        <h2 class="label" id="shipping" style="margin-top:36px;color:var(--text)">${t('foot.ship')}</h2>
        <p class="muted">Every order ships from ${esc(P.madeIn)}. Each store packs its own order, so if you buy from two stores you'll get two parcels.</p>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Zone</th><th class="num">${t('co.std')}</th><th>Time</th><th class="num">${t('co.exp')}</th><th>Time</th></tr></thead><tbody>
        ${P.shipping.map((z) => `<tr><td>${esc(z.label)}</td><td class="num">${money(z.standard[0])}</td><td>${esc(z.standard[1])}</td><td class="num">${money(z.express[0])}</td><td>${esc(z.express[1])}</td></tr>`).join('')}
        </tbody></table></div>
        <p class="small muted">Sample rates. Printed-to-order items add 3–5 business days; pre-orders ship by the date on the product page.</p>
        <h2 class="label" id="returns" style="margin-top:36px;color:var(--text)">${t('foot.ret')}</h2>
        <p class="muted">Misprinted, damaged or wrong items are replaced free: contact us within 14 days of delivery with a photo. Clothing gets one free size exchange within 14 days. Signed items and pre-orders are final sale once shipped.</p>
        <h2 class="label" id="sizes" style="margin-top:36px;color:var(--text)">${t('foot.sizes')}</h2>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${t('size')}</th><th class="num">Chest width (cm)</th><th class="num">Length (cm)</th><th class="num">Chest width (in)</th><th class="num">Length (in)</th></tr></thead><tbody>
        ${SIZE_CM.map(([s, c, l]) => `<tr><td>${s}</td><td class="num">${c}</td><td class="num">${l}</td><td class="num">${(c / 2.54).toFixed(1)}</td><td class="num">${(l / 2.54).toFixed(1)}</td></tr>`).join('')}
        </tbody></table></div>
        <p class="small muted">Measured flat, armpit to armpit. Asian sizing runs about one size smaller than US sizing; if you're between sizes, go up.</p>
      </div></section>`,
    };
  }

  function pageNotFound() {
    return { title: t('nf'), html: `<div class="wrap section"><div class="empty"><h1 class="h-section">${t('nf')}</h1><p>${t('nf.d')}</p><a class="btn btn-ghost" href="#/">${t('home')}</a></div></div>` };
  }

  // ================================================================= ROUTER
  const ROUTES = [
    [/^\/?$/, pageHome],
    [/^\/promotions$/, pagePromotions],
    [/^\/wrestlers$/, pageWrestlers],
    [/^\/shop$/, pageShop],
    [/^\/p\/([^/]+)$/, pagePromotion, ['promo']],
    [/^\/p\/([^/]+)\/([^/]+)$/, pageStore, ['promo', 'slug']],
    [/^\/product\/([^/]+)$/, pageProduct, ['id']],
    [/^\/checkout\/(.+)$/, pageCheckout, ['store']],
    [/^\/order\/([^/]+)$/, pageOrder, ['id']],
    [/^\/orders$/, pageFindOrder],
    [/^\/studio$/, pageStudio],
    [/^\/studio\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/, pageStudio, ['promo', 'slug', 'tab']],
    [/^\/platform$/, pagePlatform],
    [/^\/help$/, pageHelp],
  ];

  let lastPath = null;
  function route() {
    const raw = here().replace(/^#/, '') || '/';
    const [pathPart, anchor] = raw.split('#');
    const [path, qs] = pathPart.split('?');
    const q = new URLSearchParams(qs || '');
    let view = null;
    for (const [re, fn, names] of ROUTES) {
      const m = path.match(re);
      if (m) {
        const params = {};
        (names || []).forEach((n, i) => { params[n] = m[i + 1] && decodeURIComponent(m[i + 1]); });
        view = fn(params, q);
        break;
      }
    }
    if (!view) view = pageNotFound();
    applyTheme(view.theme || null);
    app().innerHTML = view.html;
    document.title = view.title || API.platform().name;
    markNav(view.nav);
    $('#mobile-nav')?.classList.remove('open');
    if (view.after) view.after();
    if (anchor) { const el = document.getElementById(anchor); if (el) el.scrollIntoView(); }
    else if (path !== lastPath) window.scrollTo(0, 0);
    lastPath = path;
  }

  // ================================================================= EVENTS
  function onClick(e) {
    if (MEMORY) {
      const l = e.target.closest('a[href^="#/"]');
      if (l) { e.preventDefault(); go(l.getAttribute('href')); }
      if (e.target.closest('[data-act="back"]')) { e.preventDefault(); if (memStack.length) { memPath = memStack.pop(); route(); } return; }
    }
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const act = a.dataset.act;
    switch (act) {
      case 'bag': openBag(); break;
      case 'close-bag': closeBag(); break;
      case 'search': openSearch(); break;
      case 'close-search': closeSearch(); break;
      case 'menu': $('#mobile-nav').classList.toggle('open'); break;
      case 'reset': e.preventDefault(); API.resetDemo(); if (!MEMORY) location.hash = '#/'; location.reload(); break;
      case 'scroll': e.preventDefault(); document.getElementById(a.dataset.to)?.scrollIntoView({ behavior: 'smooth' }); break;
      case 'copy-link': {
        const url = location.href;
        try { navigator.clipboard.writeText(url).then(() => toast(t('copied'))).catch(() => toast(url)); } catch (err) { toast(url); }
        break;
      }
      case 'qty': case 'rm': {
        const k = a.dataset.store, i = +a.dataset.i;
        const items = S.bags[k] || [];
        if (!items[i]) break;
        if (act === 'rm') items.splice(i, 1);
        else items[i].qty = Math.max(1, Math.min(10, items[i].qty + +a.dataset.d));
        saveBags(); renderBag();
        if (here().startsWith('#/checkout/')) rerenderCheckout();
        break;
      }
      // product page
      case 'color': PDP.color = a.dataset.v; rerenderPDP(); break;
      case 'option': PDP.option = a.dataset.v; rerenderPDP(); break;
      case 'size': if (a.getAttribute('aria-disabled') !== 'true') { PDP.size = a.dataset.v; rerenderPDP(); } else { PDP.size = a.dataset.v; rerenderPDP(); } break;
      case 'view': { PDP.view = +a.dataset.i; const g = $('#gal'); if (g) g.scrollTo({ left: g.clientWidth * PDP.view, behavior: 'smooth' }); $$('.gallery-thumbs button').forEach((b, j) => b.classList.toggle('on', j === PDP.view)); break; }
      case 'pqty': PDP.qty = Math.max(1, Math.min(10, PDP.qty + +a.dataset.d)); rerenderPDP(); break;
      case 'notify': toast(t('notified')); break;
      case 'add': {
        const p = API.product(PDP.id);
        if (a.dataset.need === 'size') { $('.sizes')?.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 250 }); break; }
        const v = currentVariant(p);
        if (v) addToBag(p, v.sku, PDP.qty);
        break;
      }
      case 'toggle-live': {
        const p = API.product(a.dataset.id);
        if (!p || a.disabled) break;
        API.updateProduct(p.id, { hidden: !p.hidden });
        a.classList.toggle('on', !p.hidden);
        toast(p.hidden ? `${p.title} is hidden from the store` : `${p.title} is live`);
        break;
      }
      default: break;
    }
  }

  function onChange(e) {
    const el = e.target;
    const act = el.dataset.act;
    if (act === 'currency') { S.currency = el.value; API.prefs.set('currency', S.currency); renderChrome(); route(); if ($('#drawer').classList.contains('open')) renderBag(); return; }
    if (act === 'lang') { S.lang = el.value; API.prefs.set('lang', S.lang); I18N.set(S.lang); renderChrome(); route(); return; }
    if (act === 'country') {
      S.country = el.value; API.prefs.set('country', S.country);
      if (here().startsWith('#/checkout/')) rerenderCheckout(); else rerenderPDP();
      return;
    }
    if (act === 'method') { CO.method = el.value; rerenderCheckout(); return; }
    if (act === 'pay') { CO.pay = el.value; rerenderCheckout(); return; }
    if (act === 'studio-as') { const tab = (here().split('/')[4] || 'overview'); go(`#/studio/${el.value}/${tab}`); return; }
    if (act === 'set-price') {
      const v = Math.max(5, Math.round(+el.value || 0));
      API.updateProduct(el.dataset.id, { price: v });
      toast(`Price saved: ${money(v)}`);
      return;
    }
    if (el.dataset.filter) {
      const base = el.dataset.base;
      const q = new URLSearchParams((here().split('?')[1] || ''));
      if (el.value) q.set(el.dataset.filter, el.value); else q.delete(el.dataset.filter);
      const s = q.toString();
      go(`#/${base}${s ? '?' + s : ''}`);
      return;
    }
    if (act === 'nd') { ndUpdate(el); return; }
    if (act === 'nd-file') {
      const f = el.files && el.files[0];
      if (!f) return;
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = () => {
          const c = document.createElement('canvas');
          const s = Math.min(1, 700 / Math.max(img.width, img.height));
          c.width = img.width * s; c.height = img.height * s;
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          NEW.artwork = c.toDataURL('image/png');
          $('#studio-body').innerHTML = studioNew(NEW.key);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(f);
    }
  }

  function ndUpdate(el) {
    NEW[el.name] = el.name === 'price' ? +el.value : el.value;
    if (el.name === 'type' && NEW.price < 40 && el.value === 'hoodie') { NEW.price = 58; const pi = $('#nd-price'); if (pi) pi.value = 58; }
    $('#nd-prev').innerHTML = ndPreview(NEW.key);
    $('#earn').innerHTML = earnHTML();
  }

  function onInput(e) {
    const el = e.target;
    if (el.dataset.act === 'nd' && (el.name === 'price' || el.name === 'title')) { NEW[el.name] = el.name === 'price' ? +el.value : el.value; $('#earn').innerHTML = earnHTML(); }
    if (el.dataset.filter === 'q') {
      clearTimeout(onInput.tm);
      onInput.tm = setTimeout(() => {
        const base = el.dataset.base;
        const q = new URLSearchParams((here().split('?')[1] || ''));
        if (el.value) q.set('q', el.value); else q.delete('q');
        const s = q.toString();
        go(`#/${base}${s ? '?' + s : ''}`, true);
        const again = $(`[data-filter="q"][data-base="${base}"]`);
        if (again) { again.focus(); again.setSelectionRange(again.value.length, again.value.length); }
      }, 220);
    }
  }

  function onSubmit(e) {
    const f = e.target;
    const kind = f.dataset.form;
    if (!kind) return;
    e.preventDefault();
    if (kind === 'checkout') placeOrder(f);
    else if (kind === 'news') { f.reset(); toast(t('news.ok')); }
    else if (kind === 'find') {
      const d = Object.fromEntries(new FormData(f));
      const o = API.findOrder(d.id, d.email);
      if (o) go(`#/order/${o.id}`); else $('#find-msg').textContent = t('find.none');
    } else if (kind === 'design') {
      const key = NEW.key;
      const tl = API.talent(key);
      const id = `${key.replace('/', '-')}-sub-${Date.now().toString(36)}`;
      const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
      const color = { name: NEW.color, hex: BLANK_HEX[NEW.color] };
      const product = {
        id, store: key, promotion: tl.promotion, talent: [key], title: NEW.title || `${tl.name} Tee`, type: NEW.type, price: +NEW.price || 28,
        baseCost: NEW.type === 'hoodie' ? 21 : 9.5, fulfilment: NEW.fulfilment, description: 'New design submitted from the store manager.', colors: [color],
        sample: true, created: new Date().toISOString().slice(0, 10), status: 'review', hidden: true,
        design: { style: NEW.artwork ? 'upload' : NEW.style, artwork: NEW.artwork },
        variants: sizes.map((s) => ({ sku: `${id.toUpperCase()}-${s}`, color: color.name, size: s, stock: NEW.fulfilment === 'stock' ? 20 : null })),
      };
      if (NEW.fulfilment === 'preorder') { const d = new Date(); d.setDate(d.getDate() + 30); product.shipsBy = d.toISOString().slice(0, 10); }
      API.submitDesign(product);
      NEW.key = null;
      toast('Sent to the factory for review');
      go(`#/studio/${tl.promotion}/${tl.id}/products`);
    } else if (kind === 'settings') {
      const d = Object.fromEntries(new FormData(f));
      const key = here().split('/').slice(2, 4).join('/');
      API.saveStoreSettings(key, d);
      toast('Store settings saved');
    }
  }

  // ================================================================= BOOT
  async function boot() {
    try {
      await API.load();
    } catch (err) {
      app().innerHTML = `<div class="wrap section"><h1 class="h-section">Couldn't load the catalogue</h1><p class="muted">Open this site through a web server (for example <code class="inline">python3 -m http.server</code>), not by double-clicking the file.</p></div>`;
      return;
    }
    initPrefs();
    renderChrome();
    document.addEventListener('click', onClick);
    document.addEventListener('change', onChange);
    document.addEventListener('input', onInput);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeBag(); closeSearch(); } if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); } });
    $('#scrim').addEventListener('click', closeBag);
    window.addEventListener('hashchange', () => { closeSearch(); route(); });
    route();
  }
  boot();
})();
