/* =====================================================================
   Product art
   ---------------------------------------------------------------------
   Real merch uses photos (product.images). Sample products carry a
   "design" instead, and this file draws them as inline SVG: a blank
   (tee, hoodie, 8x10, poster) plus a print built from the wrestler's
   photo, name and their promotion's colours. Swapping colour variants
   re-colours the blank live.
   ===================================================================== */
(function () {
  let uid = 0;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const up = (s) => String(s || '').toUpperCase();

  // Rough Anton width per character (em). Used to size text to fit a print area.
  function fit(text, width, max, min = 8, em = 0.47) {
    const n = Math.max(String(text).length, 1);
    return Math.max(min, Math.min(max, width / (n * em)));
  }

  function isLight(hex) {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
  }

  function shade(hex, amt) {
    const h = hex.replace('#', '');
    const c = [0, 2, 4].map((i) => Math.max(0, Math.min(255, parseInt(h.slice(i, i + 2), 16) + amt)));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  // ---------- Blanks ----------
  const TEE = {
    front: 'M150 30 Q200 76 250 30 L318 46 C344 54 372 84 394 132 L352 168 L320 148 C314 250 322 350 322 420 Q200 432 78 420 C78 350 86 250 80 148 L48 168 L6 132 C28 84 56 54 82 46 Z',
    back: 'M150 30 Q200 44 250 30 L318 46 C344 54 372 84 394 132 L352 168 L320 148 C314 250 322 350 322 420 Q200 432 78 420 C78 350 86 250 80 148 L48 168 L6 132 C28 84 56 54 82 46 Z',
    collarFront: 'M150 30 Q200 76 250 30',
    collarBack: 'M150 30 Q200 44 250 30',
  };

  function teeBlank(color, view, id, inner) {
    const light = isLight(color);
    const path = view === 'back' ? TEE.back : TEE.front;
    const collar = view === 'back' ? TEE.collarBack : TEE.collarFront;
    const edge = light ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.06)';
    return `
      <defs>
        <clipPath id="c${id}"><path d="${path}"/></clipPath>
        <linearGradient id="s${id}" x1="0" x2="1">
          <stop offset="0" stop-color="#000" stop-opacity="${light ? .14 : .45}"/>
          <stop offset=".18" stop-color="#000" stop-opacity="0"/>
          <stop offset=".5" stop-color="#fff" stop-opacity="${light ? .05 : .05}"/>
          <stop offset=".82" stop-color="#000" stop-opacity="0"/>
          <stop offset="1" stop-color="#000" stop-opacity="${light ? .16 : .5}"/>
        </linearGradient>
        <linearGradient id="v${id}" y1="0" y2="1" x1="0" x2="0">
          <stop offset="0" stop-color="#fff" stop-opacity="${light ? 0 : .04}"/>
          <stop offset="1" stop-color="#000" stop-opacity="${light ? .08 : .25}"/>
        </linearGradient>
        <filter id="b${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
      </defs>
      <ellipse cx="200" cy="430" rx="150" ry="10" fill="#000" opacity=".12" filter="url(#b${id})"/>
      <path d="${path}" fill="${color}" stroke="${edge}" stroke-width="1.5"/>
      <g clip-path="url(#c${id})">
        ${inner || ''}
        <rect width="400" height="440" fill="url(#s${id})"/>
        <rect width="400" height="440" fill="url(#v${id})"/>
        <path d="M80 148 C96 170 98 210 92 250" stroke="#000" stroke-opacity="${light ? .07 : .3}" stroke-width="10" fill="none" filter="url(#b${id})"/>
        <path d="M320 148 C304 170 302 210 308 250" stroke="#000" stroke-opacity="${light ? .07 : .3}" stroke-width="10" fill="none" filter="url(#b${id})"/>
        <path d="M120 330 C170 350 230 320 290 360" stroke="#000" stroke-opacity="${light ? .05 : .22}" stroke-width="14" fill="none" filter="url(#b${id})"/>
        <path d="M48 168 L82 150" stroke="#000" stroke-opacity="${light ? .1 : .35}" stroke-width="3" fill="none"/>
        <path d="M352 168 L318 150" stroke="#000" stroke-opacity="${light ? .1 : .35}" stroke-width="3" fill="none"/>
      </g>
      <path d="${collar}" fill="none" stroke="${shade(color, light ? -28 : 22)}" stroke-width="9" stroke-linecap="round"/>
      <path d="${collar}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1"/>`;
  }

  const HOODIE = {
    body: 'M142 54 L98 66 C66 76 52 100 46 140 L22 362 Q20 386 44 390 L62 392 Q78 390 78 374 L94 196 L94 412 Q94 428 110 428 L290 428 Q306 428 306 412 L306 196 L322 374 Q322 390 338 392 L356 390 Q380 386 378 362 L354 140 C348 100 334 76 302 66 L258 54 Z',
    hood: 'M136 66 C126 14 274 14 264 66 C250 40 150 40 136 66 Z',
    opening: 'M142 54 C150 112 250 112 258 54 C240 70 160 70 142 54 Z',
  };

  function hoodieBlank(color, view, id, inner) {
    const light = isLight(color);
    const edge = light ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.06)';
    const dark = shade(color, light ? -30 : -14);
    const rib = shade(color, light ? -16 : 12);
    const front = view !== 'back';
    return `
      <defs>
        <clipPath id="c${id}"><path d="${HOODIE.body}"/></clipPath>
        <linearGradient id="s${id}" x1="0" x2="1">
          <stop offset="0" stop-color="#000" stop-opacity="${light ? .14 : .5}"/>
          <stop offset=".2" stop-color="#000" stop-opacity="0"/>
          <stop offset=".8" stop-color="#000" stop-opacity="0"/>
          <stop offset="1" stop-color="#000" stop-opacity="${light ? .16 : .5}"/>
        </linearGradient>
        <filter id="b${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
      </defs>
      <ellipse cx="200" cy="434" rx="160" ry="9" fill="#000" opacity=".12" filter="url(#b${id})"/>
      ${front ? `<path d="${HOODIE.hood}" fill="${dark}"/>` : ''}
      <path d="${HOODIE.body}" fill="${color}" stroke="${edge}" stroke-width="1.5"/>
      <g clip-path="url(#c${id})">
        ${inner || ''}
        ${front ? `<path d="M126 300 L274 300 L292 392 L108 392 Z" fill="none" stroke="#000" stroke-opacity="${light ? .14 : .45}" stroke-width="2"/>
        <path d="M126 300 L108 392" stroke="#000" stroke-opacity="${light ? .08 : .3}" stroke-width="8" filter="url(#b${id})"/>
        <path d="M274 300 L292 392" stroke="#000" stroke-opacity="${light ? .08 : .3}" stroke-width="8" filter="url(#b${id})"/>` : `
        <path d="M120 54 C120 150 280 150 280 54" fill="${dark}" opacity=".65"/>`}
        <rect x="90" y="404" width="220" height="30" fill="${rib}"/>
        <rect x="18" y="366" width="64" height="30" fill="${rib}" transform="rotate(4 50 380)"/>
        <rect x="318" y="366" width="64" height="30" fill="${rib}" transform="rotate(-4 350 380)"/>
        <rect width="400" height="440" fill="url(#s${id})"/>
        <path d="M94 196 L94 300" stroke="#000" stroke-opacity="${light ? .08 : .35}" stroke-width="10" filter="url(#b${id})"/>
        <path d="M306 196 L306 300" stroke="#000" stroke-opacity="${light ? .08 : .35}" stroke-width="10" filter="url(#b${id})"/>
      </g>
      ${front ? `<path d="${HOODIE.opening}" fill="${shade(color, light ? -50 : -8)}"/>
      <path d="M184 84 L180 176" stroke="${light ? '#cfcac0' : '#e8e6e0'}" stroke-width="3" stroke-linecap="round"/>
      <path d="M216 84 L220 176" stroke="${light ? '#cfcac0' : '#e8e6e0'}" stroke-width="3" stroke-linecap="round"/>
      <rect x="176.5" y="172" width="7" height="12" rx="2" fill="${light ? '#9b968b' : '#bdb9b0'}"/>
      <rect x="216.5" y="172" width="7" height="12" rx="2" fill="${light ? '#9b968b' : '#bdb9b0'}"/>` : ''}`;
  }

  // ---------- Prints ----------
  function inkFor(blank, theme) {
    const light = isLight(blank);
    return {
      main: light ? '#141414' : '#f4f2ec',
      accent: light ? (theme.primary || '#141414') : (theme.accent || theme.primary || '#f4f2ec'),
      second: light ? (theme.accentDeep || theme.primary || '#555') : (theme.primary || '#999'),
    };
  }

  function txt(x, y, s, size, fill, opts = {}) {
    const anchor = opts.anchor || 'middle';
    const fam = opts.font || "Anton, Impact, 'Arial Narrow', sans-serif";
    const style = opts.italic ? 'font-style:italic;' : '';
    const ls = opts.ls != null ? `letter-spacing:${opts.ls}px;` : '';
    const weight = opts.weight ? `font-weight:${opts.weight};` : '';
    const tl = opts.max ? ` textLength="${opts.max}" lengthAdjust="spacingAndGlyphs"` : '';
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" style="font-family:${fam};font-size:${size.toFixed(1)}px;${style}${ls}${weight}"${opts.fitExact ? tl : ''}>${esc(s)}</text>`;
  }

  // Fit a line into width w. Compress with textLength only if the estimate overflows.
  function line(x, y, s, w, maxSize, fill, opts = {}) {
    const em = opts.em || 0.47;
    const size = fit(s, w, maxSize, 6, em);
    const est = String(s).length * size * em;
    return txt(x, y, s, size, fill, { ...opts, max: Math.min(w, est), fitExact: est > w * 0.98 });
  }

  function photoBlock(id, href, x, y, w, h, opts = {}) {
    const r = opts.round ? `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2}"/>` : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${opts.rx || 0}"/>`;
    const k = `p${id}_${uid++}`;
    return `<clipPath id="${k}">${r}</clipPath>
      <image href="${esc(href)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${k})"/>`;
  }

  function printPhoto(ctx, blank, view, id, area) {
    const t = ctx.talent[0] || {};
    const ink = inkFor(blank, ctx.theme);
    const { cx, top, w } = area;
    if (view === 'back') {
      const nm = up(t.name);
      return `${line(cx, top + 26, up(t.nickname || ctx.promo.short), w * .8, 18, ink.accent, { italic: ctx.theme.italic })}
        ${line(cx, top + 92, nm, w, 64, ink.main, { italic: ctx.theme.italic })}
        ${line(cx, top + 122, up(ctx.promo.name), w * .7, 12, ink.main, { font: "Oswald, 'Arial Narrow', sans-serif", ls: 2 })}`;
    }
    const ph = w * .86;
    const px = cx - ph / 2;
    const nick = t.nickname || t.title || ctx.promo.short;
    return `${line(cx, top + 14, up(nick), w * .9, 14, ink.accent, { italic: ctx.theme.italic, ls: .5 })}
      <rect x="${px - 3}" y="${top + 21}" width="${ph + 6}" height="${ph + 6}" fill="${ink.accent}"/>
      ${photoBlock(id, t.photo, px, top + 24, ph, ph)}
      ${line(cx, top + 24 + ph + 40, up(t.name), w, 40, ink.main, { italic: ctx.theme.italic })}
      ${line(cx, top + 24 + ph + 58, up(ctx.promo.short) + ' • ' + up(ctx.promo.country), w * .7, 11, ink.accent, { font: "Oswald, 'Arial Narrow', sans-serif", ls: 2 })}`;
  }

  function printType(ctx, blank, view, id, area) {
    const t = ctx.talent[0] || {};
    const ink = inkFor(blank, ctx.theme);
    const { cx, top, w } = area;
    const words = up(t.name).split(/\s+/);
    if (view === 'back') {
      return `${line(cx, top + 30, up(t.name), w * 1.05, 44, ink.main, { italic: ctx.theme.italic })}
        <polygon points="${cx - 24},${top + 49} ${cx - 20},${top + 44} ${cx + 28},${top + 44} ${cx + 24},${top + 49}" fill="${ink.accent}"/>
        ${line(cx, top + 78, up(ctx.promo.short), w * .5, 22, ink.accent, { italic: ctx.theme.italic })}`;
    }
    let y = top + 10;
    let out = line(cx, y + 14, up(t.nickname || t.title || ctx.promo.name), w * .9, 13, ink.accent, { italic: ctx.theme.italic, ls: 1 });
    y += 26;
    const lines = words.length > 3 ? [words.slice(0, 2).join(' '), words.slice(2).join(' ')] : words;
    for (const word of lines) {
      const s = fit(word, w, 76, 8, 0.47);
      y += s * 0.92;
      out += line(cx, y, word, w, 76, ink.main, { italic: ctx.theme.italic });
      y += 4;
    }
    out += `<rect x="${cx - w / 2}" y="${y + 6}" width="${w}" height="4" fill="${ink.accent}"/>`;
    out += line(cx, y + 30, up(ctx.promo.short) + ' • EST. ROSTER', w * .7, 11, ink.main, { font: "Oswald, 'Arial Narrow', sans-serif", ls: 2 });
    return out;
  }

  function printChampion(ctx, blank, view, id, area) {
    const t = ctx.talent[0] || {};
    const { cx, top, w } = area;
    const gold = `g${id}`;
    const grad = `<linearGradient id="${gold}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".45" stop-color="#f2c94c"/><stop offset=".55" stop-color="#b8892a"/><stop offset="1" stop-color="#f7d774"/></linearGradient>`;
    if (view === 'back') {
      return `${grad}${line(cx, top + 40, 'AND STILL', w * .8, 26, `url(#${gold})`, { italic: true })}
        ${line(cx, top + 100, up(t.name), w, 52, '#f4f2ec', { italic: ctx.theme.italic })}
        ${line(cx, top + 126, up(t.title || 'Champion'), w * .9, 14, `url(#${gold})`, { font: "Oswald, 'Arial Narrow', sans-serif", ls: 1.5 })}`;
    }
    const r = w * .38;
    return `${grad}
      <circle cx="${cx}" cy="${top + 18 + r}" r="${r + 5}" fill="url(#${gold})"/>
      ${photoBlock(id, t.photo, cx - r, top + 18, r * 2, r * 2, { round: true })}
      ${line(cx, top + 18 + r * 2 + 40, 'CHAMPION', w * .95, 40, `url(#${gold})`, { italic: true })}
      ${line(cx, top + 18 + r * 2 + 64, up(t.name), w * .8, 20, '#f4f2ec', { italic: ctx.theme.italic })}
      ${line(cx, top + 18 + r * 2 + 82, up(t.title || ''), w * .8, 10, `url(#${gold})`, { font: "Oswald, 'Arial Narrow', sans-serif", ls: 1.5 })}`;
  }

  function printTeam(ctx, blank, view, id, area) {
    const ink = inkFor(blank, ctx.theme);
    const { cx, top, w } = area;
    const team = ctx.team || { name: '' };
    const mem = ctx.talent;
    if (view === 'back') {
      let y = top + 30;
      let out = line(cx, y, up(team.name), w, 30, ink.accent, { italic: ctx.theme.italic });
      y += 30;
      for (const m of mem) { out += line(cx, y, up(m.name), w * .7, 20, ink.main, { italic: ctx.theme.italic }); y += 26; }
      return out;
    }
    const n = Math.max(mem.length, 1);
    const gap = 4;
    const pw = (w - gap * (n - 1)) / n;
    let out = line(cx, top + 14, up(ctx.promo.short) + ' TAG TEAM', w * .8, 12, ink.accent, { font: "Oswald, 'Arial Narrow', sans-serif", ls: 2 });
    mem.forEach((m, i) => {
      out += photoBlock(id, m.photo, cx - w / 2 + i * (pw + gap), top + 24, pw, pw * 1.25);
    });
    out += `<rect x="${cx - w / 2}" y="${top + 24 + pw * 1.25 + 4}" width="${w}" height="3" fill="${ink.accent}"/>`;
    out += line(cx, top + 24 + pw * 1.25 + 44, up(team.name), w, 40, ink.main, { italic: ctx.theme.italic });
    return out;
  }

  function printLogo(ctx, blank, view, id, area) {
    const ink = inkFor(blank, ctx.theme);
    const { cx, top, w } = area;
    if (view === 'back') {
      return `${line(cx, top + 10, up(ctx.promo.name), w * .9, 13, ink.main, { font: "Oswald, 'Arial Narrow', sans-serif", ls: 2 })}
        ${line(cx, top + 28, up(ctx.promo.city || ctx.promo.country), w * .6, 10, ink.accent, { font: "Oswald, 'Arial Narrow', sans-serif", ls: 2 })}`;
    }
    const lw = w * .95;
    const logo = ctx.promo.logoLight && isLight(blank) ? ctx.promo.logoLight : ctx.promo.logo;
    const bg = ctx.promo.logoNeedsDark && isLight(blank) ? `<rect x="${cx - lw / 2 - 8}" y="${top + 2}" width="${lw + 16}" height="${lw * .62 + 12}" rx="6" fill="#141414"/>` : '';
    return `${bg}<image href="${esc(logo)}" x="${cx - lw / 2}" y="${top + 8}" width="${lw}" height="${lw * .6}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  function printRoster(ctx, blank, view, id, area) {
    const ink = inkFor(blank, ctx.theme);
    const { cx, top, w } = area;
    if (view !== 'back') {
      // small left-chest logo
      const lw = 58;
      return `<image href="${esc(ctx.promo.logo)}" x="${cx + 18}" y="${top - 14}" width="${lw}" height="${lw * .6}" preserveAspectRatio="xMidYMid meet"/>`;
    }
    const people = ctx.talent.slice(0, 12);
    const cols = 4;
    const gap = 3;
    const ww = w * 1.18;
    const pw = (ww - gap * (cols - 1)) / cols;
    let out = line(cx, top + 18, up(ctx.promo.short) + ' ROSTER', ww * .9, 30, ink.main, { italic: ctx.theme.italic });
    out += `<rect x="${cx - ww / 2}" y="${top + 26}" width="${ww}" height="3" fill="${ink.accent}"/>`;
    people.forEach((p, i) => {
      const x = cx - ww / 2 + (i % cols) * (pw + gap);
      const y = top + 34 + Math.floor(i / cols) * (pw + gap);
      out += photoBlock(id, p.photo, x, y, pw, pw);
    });
    const rows = Math.ceil(people.length / cols);
    out += line(cx, top + 34 + rows * (pw + gap) + 18, up(ctx.promo.city || ctx.promo.country), ww * .6, 12, ink.accent, { font: "Oswald, 'Arial Narrow', sans-serif", ls: 3 });
    return out;
  }

  // Artwork uploaded from the store manager (data URL), placed in the print area.
  function printUpload(ctx, blank, view, id, area, design) {
    const ink = inkFor(blank, ctx.theme);
    const { cx, top, w } = area;
    const t = ctx.talent[0] || {};
    if (view === 'back') {
      return `${line(cx, top + 30, up(t.name), w, 40, ink.main, { italic: ctx.theme.italic })}
        ${line(cx, top + 52, up(ctx.promo.short), w * .5, 14, ink.accent, { font: "Oswald, 'Arial Narrow', sans-serif", ls: 2 })}`;
    }
    if (!design.artwork) return printPhoto(ctx, blank, view, id, area);
    const h = w * 1.25;
    return `<image href="${esc(design.artwork)}" x="${cx - w / 2}" y="${top}" width="${w}" height="${h}" preserveAspectRatio="xMidYMin meet"/>`;
  }

  const PRINTS = { photo: printPhoto, type: printType, champion: printChampion, team: printTeam, logo: printLogo, roster: printRoster, upload: printUpload };

  // ---------- Flat goods ----------
  function signed(ctx, id, opts) {
    const t = ctx.talent[0] || {};
    const words = t.name.split(' ').filter((w) => !/^(the|da|el|mr\.?|ms\.?)$/i.test(w));
    const sig = t.name.length <= 11 ? t.name : (words.sort((a, b) => b.length - a.length)[0] || t.name);
    return `
      <defs><filter id="b${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter></defs>
      <g transform="rotate(-3 200 220)">
        <rect x="76" y="44" width="248" height="320" fill="#000" opacity=".25" filter="url(#b${id})" transform="translate(6 10)"/>
        <rect x="76" y="40" width="248" height="320" fill="#fbfaf6"/>
        ${photoBlock(id, t.photo, 88, 52, 224, 270)}
        <text x="236" y="296" text-anchor="middle" fill="${ctx.theme.signature || '#f4f1ea'}" style="font-family:'Permanent Marker',cursive;font-size:${fit(sig, 130, 34, 16, .55).toFixed(1)}px" transform="rotate(-9 236 296)">${esc(sig)}</text>
        <path d="M178 312 C210 306 260 300 300 288" stroke="${ctx.theme.signature || '#f4f1ea'}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".9"/>
        ${line(200, 344, up(t.name), 200, 16, '#141414', { italic: ctx.theme.italic })}
      </g>`;
  }

  function poster(ctx, id) {
    const t = ctx.talent[0] || {};
    const k = `g${id}`;
    return `
      <defs>
        <filter id="b${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
        <linearGradient id="${k}" x1="0" x2="0" y1="0" y2="1"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".95"/></linearGradient>
      </defs>
      <rect x="92" y="30" width="216" height="304" fill="#000" opacity=".25" filter="url(#b${id})" transform="translate(6 10)"/>
      <rect x="92" y="26" width="216" height="304" fill="#0d0d0d"/>
      ${photoBlock(id, t.photo, 92, 26, 216, 304)}
      <rect x="92" y="26" width="216" height="304" fill="url(#${k})"/>
      <rect x="92" y="26" width="216" height="6" fill="${ctx.theme.accent || '#fff'}"/>
      ${line(200, 282, up(t.name), 196, 42, '#f4f2ec', { italic: ctx.theme.italic })}
      ${line(200, 302, up(t.nickname || t.title || ctx.promo.name), 170, 12, ctx.theme.accent || '#fff', { font: "Oswald, 'Arial Narrow', sans-serif", ls: 2 })}
      <image href="${esc(ctx.promo.logo)}" x="170" y="308" width="60" height="18" preserveAspectRatio="xMidYMid meet"/>`;
  }

  /**
   * render(product, ctx, opts) -> SVG markup
   * ctx: { talent:[{name,nickname,title,photo}], team, promo:{name,short,logo,country,city}, theme }
   * opts: { view:'front'|'back', color:'#hex' }
   */
  function render(product, ctx, opts = {}) {
    const id = `a${uid++}`;
    const d = product.design || {};
    const color = opts.color || (product.colors && product.colors[0] && product.colors[0].hex) || '#141414';
    const view = opts.view || 'front';
    let body = '';
    if (product.type === 'photo') body = signed(ctx, id, opts);
    else if (product.type === 'poster') body = poster(ctx, id);
    else {
      const fn = PRINTS[d.style] || printPhoto;
      if (product.type === 'hoodie') {
        const area = view === 'back' ? { cx: 200, top: 120, w: 170 } : { cx: 200, top: 112, w: 96 };
        const print = d.style === 'logo' && view !== 'back' ? fn(ctx, color, view, id, { cx: 200, top: 186, w: 104 }, d) : fn(ctx, color, view, id, area, d);
        body = hoodieBlank(color, view, id, `<g>${print}</g>`);
      } else {
        const area = view === 'back' ? { cx: 200, top: 70, w: 170 } : { cx: 200, top: 92, w: 150 };
        const a = d.style === 'logo' && view !== 'back' ? { cx: 200, top: 104, w: 140 } : area;
        body = teeBlank(color, view, id, `<g>${fn(ctx, color, view, id, a, d)}</g>`);
      }
    }
    return `<svg class="art" viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(product.title)}">${body}</svg>`;
  }

  // Which views a product has (for the gallery).
  function views(product) {
    if (product.images) return product.images.map((src, i) => ({ kind: 'img', src, label: i === 0 ? 'Front' : 'View ' + (i + 1) }));
    if (product.type === 'photo' || product.type === 'poster') return [{ kind: 'art', view: 'front', label: 'Print' }];
    const order = product.design && product.design.style === 'roster' ? ['back', 'front'] : ['front', 'back'];
    return order.map((v) => ({ kind: 'art', view: v, label: v === 'front' ? 'Front' : 'Back' }));
  }

  window.Art = { render, views, isLight };
})();
