/* Daily Ahadith — shared language + chrome (header/footer/lang bar) logic.
   Include this on every page, then call DailyAhadith.initChrome(currentPage)
   before rendering page-specific content. */

(function (global) {
  const LANG_KEY = 'dailyAhadithLang';
  const LANG_ORDER = ['ur', 'en', 'ar', 'fa', 'ps'];
  const WHATSAPP_URL = 'https://wa.me/923008380313';

  function getLang() {
    const saved = localStorage.getItem(LANG_KEY);
    return LANG_ORDER.includes(saved) ? saved : 'ur';
  }

  function setLang(code) {
    localStorage.setItem(LANG_KEY, code);
  }

  async function loadUiStrings() {
    const res = await fetch('ui-strings.json');
    return res.json();
  }

  async function loadHadiths() {
    const res = await fetch('hadiths.json');
    const list = await res.json();
    // newest first
    return list.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  // Resolve a multi-language field with fallback: requested lang -> ur -> en -> null
  function resolveField(field, lang) {
    if (!field) return { value: null, pending: false };
    if (field[lang]) return { value: field[lang], pending: false };
    if (field.ur) return { value: field.ur, pending: lang !== 'ur' };
    if (field.en) return { value: field.en, pending: lang !== 'en' };
    return { value: null, pending: false };
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderLangBar(lang) {
    const pills = LANG_ORDER.map((code) => {
      const active = code === lang ? ' active' : '';
      const names = { ur: 'اردو', en: 'English', ar: 'العربية', fa: 'فارسی', ps: 'پښتو' };
      return `<button class="lang-pill${active}" data-lang="${code}">${names[code]}</button>`;
    }).join('');
    return `<div class="lang-bar"><div class="lang-bar-inner">${pills}</div></div>`;
  }

  function renderHeader(strings, currentPage) {
    const cur = (page) => (page === currentPage ? ' class="current"' : '');
    return `
    <div class="site-header">
      <div class="site-header-inner">
        <a href="index.html" class="brand">
          <div class="brand-mark">ح</div>
          <div>
            <div class="brand-name heading-font">${escapeHtml(strings.siteName)}</div>
            <div class="brand-tagline">${strings.tagline}</div>
          </div>
        </a>
        <div class="nav-links">
          <a href="index.html"${cur('index')}>${escapeHtml(strings.navToday)}</a>
          <a href="archive.html"${cur('archive')}>${escapeHtml(strings.navArchive)}</a>
          <a href="about.html"${cur('about')}>${escapeHtml(strings.navAbout)}</a>
          <a href="${WHATSAPP_URL}" target="_blank" rel="noopener" class="btn-join">${escapeHtml(strings.navJoin)}</a>
        </div>
      </div>
    </div>`;
  }

  function renderFooter(strings) {
    return `
    <div class="site-footer">
      <div class="site-footer-inner">
        <div class="footer-name heading-font">${escapeHtml(strings.siteName)}</div>
        <div class="footer-line">${escapeHtml(strings.footerLine)} &middot; WhatsApp: +92 300 8380313</div>
      </div>
    </div>`;
  }

  function applyDocumentLanguage(strings, lang) {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', strings.dir);
    document.documentElement.style.setProperty('--body-font', strings.bodyFont);
    document.documentElement.style.setProperty('--heading-font', strings.headingFont);
  }

  function wireLangBar(root) {
    root.querySelectorAll('.lang-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        setLang(btn.getAttribute('data-lang'));
        location.reload();
      });
    });
  }

  // Call once per page, before rendering page content.
  // currentPage: 'index' | 'archive' | 'about'
  async function initChrome(currentPage) {
    const [uiStrings] = await Promise.all([loadUiStrings()]);
    const lang = getLang();
    const strings = uiStrings[lang];

    applyDocumentLanguage(strings, lang);

    const langBarEl = document.getElementById('lang-bar');
    const headerEl = document.getElementById('site-header');
    const footerEl = document.getElementById('site-footer');

    if (langBarEl) langBarEl.outerHTML = renderLangBar(lang);
    if (headerEl) headerEl.outerHTML = renderHeader(strings, currentPage);
    if (footerEl) footerEl.outerHTML = renderFooter(strings);

    wireLangBar(document);

    return { lang, strings };
  }

  global.DailyAhadith = {
    getLang,
    setLang,
    loadUiStrings,
    loadHadiths,
    resolveField,
    escapeHtml,
    initChrome,
    WHATSAPP_URL,
  };
})(window);
