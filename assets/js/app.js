(() => {
  'use strict';

  const GAMES = Array.isArray(window.GAMEVAULT_GAMES) ? window.GAMEVAULT_GAMES : [];
  const TEAM = Array.isArray(window.GAMEVAULT_TEAM) ? window.GAMEVAULT_TEAM.slice(0, 5) : [];
  const byId = Object.fromEntries(GAMES.map((g) => [g.id, g]));
  const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo'];
  const FA = {
    PC: 'کامپیوتر', PlayStation: 'پلی‌استیشن', Xbox: 'ایکس‌باکس', Nintendo: 'نینتندو',
    RPG: 'نقش‌آفرینی', Action: 'اکشن', Adventure: 'ماجرایی', Shooter: 'تیراندازی', Platformer: 'پلتفرمر', Puzzle: 'معمایی',
    Simulation: 'شبیه‌سازی', Racing: 'مسابقه‌ای', Horror: 'ترسناک', Roguelike: 'روگ‌لایک', Sandbox: 'جعبه‌شنی', Metroidvania: 'متروید‌وانیا',
    'Open World': 'دنیای باز', 'Story Rich': 'داستان‌محور', 'Co-op': 'همکاری', Indie: 'مستقل', Classic: 'کلاسیک',
    Challenging: 'چالشی', Relaxing: 'آرامش‌بخش', Intense: 'پرهیجان'
  };
  const t = (x) => FA[x] || x;
  const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]).replace('.', '٫');
  const names = (arr) => arr.map(t).join('، ');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  function h(tag, props = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    el.append(...kids.flat().filter((x) => x != null && x !== false));
    return el;
  }

  function icon(name) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    const use = document.createElementNS(ns, 'use');
    svg.setAttribute('class', 'ic');
    svg.setAttribute('aria-hidden', 'true');
    use.setAttribute('href', '#i-' + name);
    svg.append(use);
    return svg;
  }

  const hash = (s) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 10;
  const mono = (t) => t.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter((w) => w && !/^(the|of|a|an|and)$/i.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

  const ERAS = [
    { id: 'classic', label: 'کلاسیک (قبل از ۲۰۱۰)', test: (y) => y < 2010 },
    { id: '2010s', label: '۲۰۱۰ تا ۲۰۱۶', test: (y) => y >= 2010 && y <= 2016 },
    { id: 'late', label: '۲۰۱۷ تا ۲۰۲۰', test: (y) => y >= 2017 && y <= 2020 },
    { id: 'now', label: '۲۰۲۱ به بعد', test: (y) => y >= 2021 }
  ];
  const SORTS = {
    'score-desc': { label: 'امتیاز GameVault: زیاد به کم', fn: (a, b) => b.score - a.score || a.title.localeCompare(b.title) },
    'year-desc': { label: 'سال انتشار: جدیدترین', fn: (a, b) => b.year - a.year || a.title.localeCompare(b.title) },
    'year-asc': { label: 'سال انتشار: قدیمی‌ترین', fn: (a, b) => a.year - b.year || a.title.localeCompare(b.title) },
    'title-asc': { label: 'عنوان: الفبایی (A تا Z)', fn: (a, b) => a.title.localeCompare(b.title) },
    'title-desc': { label: 'عنوان: معکوس (Z تا A)', fn: (a, b) => b.title.localeCompare(a.title) }
  };
  const COLLECTIONS = [
    { title: 'دنیاهایی که ارزش گم‌شدن دارند', blurb: 'نقشه‌های پهناور و افق‌های آرام که مسیرهای فرعی‌شان از مقصد جذاب‌تر است', tag: 'Open World', palette: 'forest' },
    { title: 'بازی‌های کوچک، ایده‌های بزرگ', blurb: 'طراحی دقیق و صدایی جسور از تیم‌های کوچک', tag: 'Indie', palette: 'aubergine' },
    { title: 'داستان‌هایی که با شما می‌مانند', blurb: 'ماجراجویی‌های روایت‌محور که هفته‌ها به آن‌ها فکر می‌کنید', tag: 'Story Rich', palette: 'navy' },
    { title: 'با هم بازی کنیم', blurb: 'بازی‌های همکاری و مشترک برای کنار هم نشستن و شب‌های بلند', tag: 'Co-op', palette: 'slate', light: true },
    { title: 'کلاسیک‌هایی که همه‌چیز را تغییر دادند', blurb: 'بازی‌های قدیمی تأثیرگذار که شکل ساخت بازی‌های امروز را تعیین کردند', tag: 'Classic', palette: 'amber', light: true },
    { title: 'حالت آدرنالین', blurb: 'اکشن سریع، سخت و بی‌وقفه، از تیراندازی‌های میدانی تا دوئل با باس‌ها', tag: 'Intense', palette: 'crimson' }
  ];
  const FEATURED = { hero: 'elden-ring', lead: 'red-dead-redemption-2', wide: ['ghost-of-tsushima', 'hades', 'celeste'], rows: ['portal-2', 'stardew-valley', 'control'] };

  const DEFAULTS = { q: '', genre: 'all', platform: 'all', era: 'all', tag: 'all', sort: 'score-desc', favOnly: false };
  const state = { ...DEFAULTS };
  const compare = { a: '', b: '' };
  let favs = new Set();
  try {
    const saved = JSON.parse(store.get('gv-favs') || '[]');
    if (Array.isArray(saved)) favs = new Set(saved.filter((id) => byId[id]));
  } catch (e) { favs = new Set(); }

  const ctl = { q: $('#f-q'), genre: $('#f-genre'), platform: $('#f-platform'), era: $('#f-era'), tag: $('#f-tag'), sort: $('#f-sort'), favOnly: $('#f-fav') };
  const grid = $('#catalog');
  const emptyBox = $('#empty');
  const dlg = $('#game-dialog');
  const dlgBody = $('#dlg-body');
  const header = $('#site-header');

  function cover(g) {
    const box = h('div', { class: `cover pal-${g.palette}${g.image ? ' has-image' : ''}`, style: `--r:${hash(g.id)}`, 'aria-hidden': 'true' },
      h('span', { class: 'cover-mono', text: mono(g.title) }),
      h('span', { class: 'cover-year', text: fa(g.year) }),
      h('span', { class: 'cover-title', text: g.title }));
    if (g.image) {
      const img = h('img', { class: 'cover-image', src: g.image, alt: '', loading: 'lazy', decoding: 'async' });
      img.addEventListener('error', () => {
        img.remove();
        box.classList.remove('has-image');
      }, { once: true });
      box.prepend(img);
    }
    return box;
  }

  function favButton(g, withText) {
    const on = favs.has(g.id);
    return h('button', {
      type: 'button',
      class: withText ? 'fav with-text' : 'fav',
      'data-fav': g.id,
      'aria-pressed': String(on),
      'aria-label': withText ? null : `علاقه‌مندی ${g.title}`
    }, icon('heart'), withText ? h('span', { text: 'علاقه‌مندی' }) : null);
  }

  function badges(g) {
    return h('div', { class: 'badges' },
      ...g.genres.slice(0, 2).map((x) => h('span', { class: 'badge', text: t(x) })),
      h('span', { class: 'badge score', title: 'امتیاز سردبیری GameVault', text: `امتیاز ${fa(g.score.toFixed(1))}` }));
  }

  function card(g, variant = 'grid') {
    return h('article', { class: `card ${variant} pal-${g.palette}` },
      h('div', { class: 'art' }, cover(g)),
      h('div', { class: 'card-body' },
        h('h3', {}, h('button', { type: 'button', class: 'title-btn', 'data-details': g.id, text: g.title })),
        h('p', { class: 'meta', text: `${fa(g.year)} \u00b7 ${names(g.platforms)}` }),
        h('p', { class: 'desc', text: g.desc }),
        badges(g),
        h('div', { class: 'actions' },
          h('button', { type: 'button', class: 'btn small', 'data-details': g.id, 'aria-label': `مشاهده جزئیات ${g.title}`, text: 'مشاهده جزئیات' }),
          favButton(g))));
  }

  function renderHero() {
    const g = byId[FEATURED.hero];
    const box = $('#hero-feature');
    if (!g || !box) return;
    box.replaceChildren(h('div', { class: `hero-card pal-${g.palette}` },
      h('span', { class: 'flag', text: 'انتخاب ویژه' }),
      cover(g),
      h('div', { class: 'hero-card-body' },
        h('p', { class: 'card-title', text: g.title }),
        h('p', { class: 'meta', text: `${fa(g.year)} \u00b7 ${names(g.genres)}` }),
        badges(g),
        h('div', { class: 'actions' },
          h('button', { type: 'button', class: 'btn small primary', 'data-details': g.id, text: 'مشاهده جزئیات' }),
          favButton(g)))));
  }

  function renderFeatured() {
    const box = $('#feat-grid');
    if (!box) return;
    const pick = (ids) => ids.map((id) => byId[id]).filter(Boolean);
    const lead = byId[FEATURED.lead];
    box.replaceChildren(
      lead ? card(lead, 'feature') : null,
      h('div', { class: 'feat-stack' }, ...pick(FEATURED.wide).map((g) => card(g, 'wide'))),
      h('div', { class: 'feat-rows' }, h('h3', { text: 'انتخاب‌های سریع' }), ...pick(FEATURED.rows).map((g) => card(g, 'row'))));
  }

  function matches(g) {
    const words = state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length) {
      const hay = [g.title, g.year, ...g.genres, ...g.platforms, ...g.tags, ...g.genres.map(t), ...g.platforms.map(t), ...g.tags.map(t)].join(' ').toLowerCase();
      if (!words.every((w) => hay.includes(w))) return false;
    }
    if (state.genre !== 'all' && !g.genres.includes(state.genre)) return false;
    if (state.platform !== 'all' && !g.platforms.includes(state.platform)) return false;
    if (state.tag !== 'all' && !g.tags.includes(state.tag)) return false;
    if (state.era !== 'all' && !ERAS.find((e) => e.id === state.era).test(g.year)) return false;
    if (state.favOnly && !favs.has(g.id)) return false;
    return true;
  }

  function renderCatalog() {
    if (!grid) return;
    const list = GAMES.filter(matches).sort((SORTS[state.sort] || SORTS['score-desc']).fn);
    grid.replaceChildren(...list.map((g) => card(g)));
    $('#result-count').textContent = `${fa(list.length)} بازی پیدا شد`;
    emptyBox.hidden = list.length > 0;
    $('#empty-text').textContent = state.favOnly && favs.size === 0
      ? 'هنوز علاقه‌مندی‌ای ذخیره نکرده‌اید روی قلب هر بازی بزنید تا اضافه شود'
      : 'جستجوی دیگری امتحان کنید یا فیلترها را کمتر کنید';
  }

  function writeControls() {
    for (const [k, el] of Object.entries(ctl)) {
      if (!el) continue;
      if (el.type === 'checkbox') el.checked = state[k]; else el.value = state[k];
    }
  }

  function readControls() {
    for (const [k, el] of Object.entries(ctl)) {
      if (!el) continue;
      state[k] = el.type === 'checkbox' ? el.checked : el.value;
    }
  }

  function applyState(patch = {}) {
    Object.assign(state, DEFAULTS, patch);
    writeControls();
    renderCatalog();
  }

  function fillSelect(el, items) {
    if (el) el.replaceChildren(...items.map(([v, l]) => h('option', { value: v, text: l })));
  }

  function initControls() {
    const uniq = (pick) => [...new Set(GAMES.flatMap(pick))].sort((a, b) => a.localeCompare(b));
    fillSelect(ctl.genre, [['all', 'همهٔ ژانرها'], ...uniq((g) => g.genres).map((x) => [x, t(x)])]);
    fillSelect(ctl.platform, [['all', 'همهٔ پلتفرم‌ها'], ...PLATFORMS.map((x) => [x, t(x)])]);
    fillSelect(ctl.era, [['all', 'هر دوره'], ...ERAS.map((e) => [e.id, e.label])]);
    fillSelect(ctl.tag, [['all', 'همهٔ تگ‌ها'], ...uniq((g) => g.tags).map((x) => [x, t(x)])]);
    fillSelect(ctl.sort, Object.entries(SORTS).map(([id, s]) => [id, s.label]));
    writeControls();
    const form = $('#filters');
    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('input', () => { readControls(); renderCatalog(); });
    form.addEventListener('change', () => { readControls(); renderCatalog(); });
    $('#clear-filters').addEventListener('click', () => applyState());
    $('#empty-clear').addEventListener('click', () => applyState());
  }

  function goTo(id, focusEl) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    if (focusEl) setTimeout(() => focusEl.focus({ preventScroll: true }), reduceMotion() ? 0 : 400);
  }

  function syncFavs() {
    $$('[data-fav]').forEach((b) => b.setAttribute('aria-pressed', String(favs.has(b.dataset.fav))));
    $('#fav-count').textContent = fa(favs.size);
    $('#btn-favs').setAttribute('aria-label', `علاقه‌مندی‌ها، ${fa(favs.size)} مورد`);
  }

  function toggleFav(id) {
    if (!byId[id]) return;
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    store.set('gv-favs', JSON.stringify([...favs]));
    syncFavs();
    if (state.favOnly) renderCatalog();
  }

  let closing = false;
  function closeDialog() {
    if (!dlg.open || closing) return;
    if (reduceMotion()) { dlg.close(); return; }
    closing = true;
    dlg.classList.add('closing');
    setTimeout(() => { dlg.classList.remove('closing'); dlg.close(); closing = false; }, 160);
  }

  function openDialog(id) {
    const g = byId[id];
    if (!g || !dlg) return;
    const chips = (items) => h('ul', { class: 'chips' }, ...items.map((x) => h('li', { text: t(x) })));
    dlgBody.replaceChildren(
      h('button', { type: 'button', class: 'icon-btn dlg-close', 'data-close': '', 'aria-label': 'بستن جزئیات' }, icon('close')),
      h('div', { class: `dlg pal-${g.palette}` },
        h('div', {}, cover(g)),
        h('div', { class: 'dlg-info' },
          h('p', { class: 'eyebrow', text: `${fa(g.year)} \u00b7 ${names(g.genres)}` }),
          h('h2', { id: 'dlg-title', text: g.title }),
          h('p', { class: 'dlg-score' }, h('strong', { text: fa(g.score.toFixed(1)) }), h('span', { text: ' امتیاز سردبیری GameVault، نه امتیاز رسمی نقد' })),
          h('p', { text: g.desc }),
          h('p', { class: 'meta', text: `انتشار در سال ${fa(g.year)}، قابل‌اجرا روی ${names(g.platforms)}.` }),
          h('h3', { class: 'mini', text: 'پلتفرم‌ها' }), chips(g.platforms),
          h('h3', { class: 'mini', text: 'تگ‌ها' }), chips(g.tags),
          h('div', { class: 'actions' }, favButton(g, true),
            h('button', { type: 'button', class: 'btn', 'data-compare': g.id, text: 'افزودن به مقایسه' })))));
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }

  const shared = (x, y) => x.filter((v) => y.includes(v));
  const chipList = (items, other) => h('ul', { class: 'chips' }, ...items.map((v) => h('li', { class: other.includes(v) ? 'shared' : null, text: t(v) })));
  const cmpRow = (label, a, b, note) => h('div', { class: 'cmp-row' }, h('div', { class: 'cmp-label', text: label }), h('div', { class: 'cmp-cell' }, a), h('div', { class: 'cmp-cell' }, b), note ? h('p', { class: 'cmp-note', text: note }) : null);
  const setNote = (list, noun) => { const s = shared(list[0], list[1]); return s.length ? `${noun} مشترک: ${names(s)}` : `${noun} مشترکی وجود ندارد`; };

  function renderCompare() {
    const selA = $('#cmp-a');
    const selB = $('#cmp-b');
    const out = $('#cmp-out');
    if (!selA || !selB || !out) return;
    selA.value = compare.a;
    selB.value = compare.b;
    [...selA.options].forEach((o) => { o.disabled = !!o.value && o.value === compare.b; });
    [...selB.options].forEach((o) => { o.disabled = !!o.value && o.value === compare.a; });
    const A = byId[compare.a];
    const B = byId[compare.b];
    if (!A || !B) {
      out.replaceChildren(h('p', { class: 'cmp-empty', text: 'دو بازی متفاوت انتخاب کنید تا مقایسه‌شان را ببینید' }));
      return;
    }
    const gap = Math.abs(A.year - B.year);
    const diff = Math.abs(A.score - B.score);
    const head = (g) => h('div', { class: 'cmp-game' }, cover(g), h('h3', { text: g.title }));
    out.replaceChildren(h('div', { class: 'cmp' },
      h('div', { class: 'cmp-head' }, h('div', { class: 'cmp-spacer' }), head(A), head(B)),
      cmpRow('سال انتشار', fa(A.year), fa(B.year), gap ? `${fa(gap)} سال فاصلهٔ انتشار` : 'در یک سال منتشر شده‌اند'),
      cmpRow('ژانرها', chipList(A.genres, B.genres), chipList(B.genres, A.genres), setNote([A.genres, B.genres], 'ژانر')),
      cmpRow('پلتفرم‌ها', chipList(A.platforms, B.platforms), chipList(B.platforms, A.platforms), setNote([A.platforms, B.platforms], 'پلتفرم')),
      cmpRow('امتیاز GameVault', fa(A.score.toFixed(1)), fa(B.score.toFixed(1)), diff ? `امتیازهای سردبیری ${fa(diff.toFixed(1))} واحد تفاوت دارند این فقط سلیقهٔ سردبیری را نشان می‌دهد و معیاری برای بهتر بودن یک بازی نیست` : 'هر دو بازی امتیاز سردبیری یکسانی دارند'),
      cmpRow('تگ‌ها', chipList(A.tags, B.tags), chipList(B.tags, A.tags), setNote([A.tags, B.tags], 'تگ'))));
  }

  function initCompare() {
    const selA = $('#cmp-a');
    const selB = $('#cmp-b');
    if (!selA || !selB) return;
    const sorted = [...GAMES].sort(SORTS['title-asc'].fn);
    const items = [['', 'یک بازی انتخاب کنید'], ...sorted.map((g) => [g.id, `${g.title} (${g.year})`])];
    fillSelect(selA, items);
    fillSelect(selB, items);
    [selA, selB].forEach((s) => s.addEventListener('change', () => { compare.a = selA.value; compare.b = selB.value; renderCompare(); }));
    $('#cmp-reset').addEventListener('click', () => { compare.a = ''; compare.b = ''; renderCompare(); });
    renderCompare();
  }

  function addToCompare(id) {
    if (!byId[id]) return;
    if (compare.a !== id && compare.b !== id) {
      if (!compare.a) compare.a = id; else compare.b = id;
    }
    renderCompare();
    closeDialog();
    goTo('compare');
  }

  function renderCollections() {
    const box = $('#coll-grid');
    if (!box) return;
    box.replaceChildren(...COLLECTIONS.map((c) => {
      const list = GAMES.filter((g) => g.tags.includes(c.tag)).sort(SORTS['score-desc'].fn);
      return h('article', { class: `coll on-dark pal-${c.palette}${c.light ? ' light' : ''}` },
        h('div', {},
          h('div', { class: 'stack' }, ...list.slice(0, 3).map((g, i) => { const el = cover(g); el.style.setProperty('--i', i); return el; })),
          h('h3', { text: c.title }),
          h('p', { text: c.blurb }),
          h('p', { class: 'coll-list', text: list.slice(0, 3).map((g) => g.title).join(' \u00b7 ') })),
        h('div', { class: 'coll-foot' },
          h('button', { type: 'button', class: 'btn', 'data-collection': c.tag }, h('span', { text: 'مشاهدهٔ بازی‌ها' }), icon('arrow')),
          h('span', { text: `${fa(list.length)} بازی` })));
    }));
  }

  function renderTeam() {
    const box = $('#team-grid');
    if (!box) return;
    const palettes = ['navy', 'crimson', 'forest', 'aubergine', 'amber'];
    box.replaceChildren(...TEAM.map((m, i) => {
      return h('li', { class: `member pal-${palettes[i % palettes.length]}` },
        h('h3', { text: m.name }),
        h('p', { class: 'role', text: m.role }));
    }));
  }

  function initStats() {
    const values = { games: GAMES.length, genres: new Set(GAMES.flatMap((g) => g.genres)).size, platforms: PLATFORMS.length };
    $$('[data-stat]').forEach((el) => { el.textContent = fa(values[el.dataset.stat] ?? 0); });
  }

  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    store.set('gv-theme', t);
    const b = $('#btn-theme');
    b.setAttribute('aria-pressed', String(t === 'light'));
    b.setAttribute('aria-label', `تغییر به تم ${t === 'light' ? 'تیره' : 'روشن'}`);
  }

  function setNav(open) {
    header.classList.toggle('nav-open', open);
    const b = $('#btn-menu');
    b.setAttribute('aria-expanded', String(open));
    b.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
  }

  function initNav() {
    const links = $$('#site-nav a');
    $('#btn-menu').addEventListener('click', () => setNav(!header.classList.contains('nav-open')));
    $('#site-nav').addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
    window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 24), { passive: true });
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => {
          if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'location');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((a) => { const s = document.getElementById(a.getAttribute('href').slice(1)); if (s) io.observe(s); });
  }

  function bindEvents() {
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-fav],[data-details],[data-compare],[data-collection],[data-close]');
      if (!t) return;
      if (t.dataset.fav) {
        toggleFav(t.dataset.fav);
        t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop');
      } else if (t.dataset.details) openDialog(t.dataset.details);
      else if (t.dataset.compare) addToCompare(t.dataset.compare);
      else if (t.dataset.collection) { applyState({ tag: t.dataset.collection }); goTo('explore'); }
      else if (t.hasAttribute('data-close')) closeDialog();
    });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) closeDialog(); });
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) { setNav(false); $('#btn-menu').focus(); }
    });
    $('#hero-search').addEventListener('submit', (e) => {
      e.preventDefault();
      applyState({ q: $('#hero-q').value });
      goTo('explore');
    });
    $('#btn-search').addEventListener('click', () => { goTo('explore', ctl.q); });
    $('#btn-favs').addEventListener('click', () => { applyState({ favOnly: true }); goTo('explore'); });
    $('#btn-theme').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'));
  }

  function init() {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
    initStats();
    renderHero();
    renderFeatured();
    initControls();
    renderCatalog();
    renderCollections();
    initCompare();
    renderTeam();
    initNav();
    bindEvents();
    syncFavs();
  }

  init();
})();
