/* Daily Ahadith — page-specific rendering. Depends on i18n.js (window.DailyAhadith). */

(function () {
  const DA = window.DailyAhadith;

  function formatDate(dateStr, lang) {
    // dateStr is YYYY-MM-DD. Keep numerals as-is; just localize month name for a few scripts.
    const [y, m, d] = dateStr.split('-').map(Number);
    const monthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const monthsUr = ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'];
    const monthsAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const monthsFa = ['ژانویه','فوریه','مارس','آوریل','مه','ژوئن','ژوئیه','اوت','سپتامبر','اکتبر','نوامبر','دسامبر'];
    const monthsPs = ['جنوري','فبروري','مارچ','اپریل','می','جون','جولای','اگست','سپتمبر','اکتوبر','نومبر','دسمبر'];
    const table = { en: monthsEn, ur: monthsUr, ar: monthsAr, fa: monthsFa, ps: monthsPs };
    const months = table[lang] || monthsEn;
    return `${d} ${months[m - 1]} ${y}`;
  }

  function hadithCardHTML(entry, lang, strings) {
    const title = DA.resolveField(entry.title, lang);
    const translation = DA.resolveField(entry.translation, lang);
    const source = DA.resolveField(entry.source, lang);
    const pendingNote = translation.pending
      ? `<div class="pending-note">${DA.escapeHtml(strings.pendingNotice)}</div>`
      : '';
    return `
      <div class="eyebrow">
        <span>${DA.escapeHtml(strings.hadithOfDay)}</span>
        <span style="color:#B8AC95;">&middot;</span>
        <span class="date">${formatDate(entry.date, lang)}</span>
      </div>
      <div class="hadith-card">
        <div class="hadith-arabic" dir="rtl">${entry.arabic}</div>
        <div class="hadith-divider"></div>
        <div class="hadith-translation" dir="${lang === 'en' ? 'ltr' : 'rtl'}">${DA.escapeHtml(translation.value || '')}</div>
        ${pendingNote}
        <div class="hadith-source">${DA.escapeHtml(strings.sourceLabel)}: ${DA.escapeHtml(source.value || '')}</div>
      </div>`;
  }

  function archiveCardHTML(entry, lang, strings) {
    const title = DA.resolveField(entry.title, lang);
    const translation = DA.resolveField(entry.translation, lang);
    return `
      <div class="archive-card">
        <div class="archive-card-date">${formatDate(entry.date, lang)}</div>
        <div class="archive-card-title heading-font">${DA.escapeHtml(title.value || '')}</div>
        <div class="archive-card-desc">${DA.escapeHtml((translation.value || '').slice(0, 140))}${(translation.value || '').length > 140 ? '…' : ''}</div>
      </div>`;
  }

  async function renderHome() {
    const { lang, strings } = await DA.initChrome('index');
    const hadiths = await DA.loadHadiths();
    const latest = hadiths[0];

    document.getElementById('hero-content').innerHTML = latest ? hadithCardHTML(latest, lang, strings) : '';

    document.getElementById('cta-row').innerHTML = `
      <a href="${DA.WHATSAPP_URL}" target="_blank" rel="noopener" class="btn-primary">${DA.escapeHtml(strings.ctaGetLesson)}</a>
      <a href="archive.html" class="btn-secondary">${DA.escapeHtml(strings.ctaBrowse)}</a>`;

    document.getElementById('how-title').textContent = strings.howTitle;
    document.getElementById('how-subtitle').textContent = strings.howSubtitle;

    const steps = [
      [strings.step1Title, strings.step1Desc],
      [strings.step2Title, strings.step2Desc],
      [strings.step3Title, strings.step3Desc],
    ];
    document.getElementById('step-grid').innerHTML = steps
      .map(
        ([title, desc], i) => `
        <div class="step-card">
          <div class="step-num">${i + 1}</div>
          <div class="step-title heading-font">${DA.escapeHtml(title)}</div>
          <div class="step-desc">${DA.escapeHtml(desc)}</div>
        </div>`
      )
      .join('');

    document.getElementById('archive-title').textContent = strings.archiveTitle;
    document.getElementById('view-all-link').textContent = strings.viewAll;
    document.getElementById('archive-preview').innerHTML = hadiths
      .slice(0, 3)
      .map((e) => archiveCardHTML(e, lang, strings))
      .join('');
  }

  async function renderArchive() {
    const { lang, strings } = await DA.initChrome('archive');
    const hadiths = await DA.loadHadiths();

    document.getElementById('archive-page-title').textContent = strings.archiveTitle;
    document.getElementById('archive-page-subtitle').textContent = strings.archiveSubtitle;

    const searchBox = document.getElementById('search-box');
    searchBox.placeholder = strings.searchPlaceholder;

    const grid = document.getElementById('archive-full-grid');
    const noResults = document.getElementById('no-results');
    noResults.textContent = strings.noResults;

    function draw(filterText) {
      const q = (filterText || '').trim().toLowerCase();
      const filtered = hadiths.filter((e) => {
        if (!q) return true;
        const title = DA.resolveField(e.title, lang).value || '';
        const translation = DA.resolveField(e.translation, lang).value || '';
        return (title + ' ' + translation + ' ' + e.arabic).toLowerCase().includes(q);
      });
      grid.innerHTML = filtered.map((e) => archiveCardHTML(e, lang, strings)).join('');
      noResults.style.display = filtered.length ? 'none' : 'block';
    }

    draw('');
    searchBox.addEventListener('input', (e) => draw(e.target.value));
  }

  async function renderAbout() {
    const { strings } = await DA.initChrome('about');

    document.getElementById('about-title').textContent = strings.aboutTitle;
    document.getElementById('about-name').textContent = strings.scholarName || 'Mufti Mohammad Ahsan Alam';
    document.getElementById('about-bio').textContent = strings.aboutBio;
    document.getElementById('about-join').innerHTML = `<a href="${DA.WHATSAPP_URL}" target="_blank" rel="noopener" style="color:var(--green);font-weight:600;">${DA.escapeHtml(strings.aboutJoin)}</a>`;

    document.getElementById('how-title').textContent = strings.aboutHowTitle;
    const steps = [
      [strings.step1Title, strings.step1Desc],
      [strings.step2Title, strings.step2Desc],
      [strings.step3Title, strings.step3Desc],
    ];
    document.getElementById('step-grid').innerHTML = steps
      .map(
        ([title, desc], i) => `
        <div class="step-card">
          <div class="step-num">${i + 1}</div>
          <div class="step-title heading-font">${DA.escapeHtml(title)}</div>
          <div class="step-desc">${DA.escapeHtml(desc)}</div>
        </div>`
      )
      .join('');
  }

  window.DailyAhadithPages = { renderHome, renderArchive, renderAbout };
})();
