/* Fundstore onboarding prototype · account area: navigation, tabs, search, mail, experts filter, activation modal */
(() => {
  const { $, $$, wait, user, esc } = window.FS;
  const { KEYWORDS, EXPERTS } = window.FS.data;

  /* =====================================================================
     Account area
     ===================================================================== */
  FS.enterApp = enterApp;

  const signup = $('#signup');
  const app = $('#app');
  const PAGES = ['dossier', 'fondi', 'movimenti', 'esperti', 'posta', 'profilo'];
  const PAGE_TITLES = { dossier: 'Dossier', fondi: 'Fondi', movimenti: 'Movimenti e Ordini', esperti: 'Esperti', posta: 'Posta', profilo: 'Profilo' };

  function fillUser() {
    const nome = user.nome || 'Edoardo';
    const cognome = user.cognome || 'Bizzarri';
    $$('[data-user="firstname"]').forEach(el => { el.textContent = nome; });
    $$('[data-user="fullname"]').forEach(el => { el.textContent = `${nome} ${cognome}`; });
    $$('[data-user="initials"]').forEach(el => { el.textContent = (nome[0] + cognome[0]).toUpperCase(); });
  }

  async function enterApp() {
    fillUser();
    signup.classList.add('is-leaving');
    await wait(350);
    signup.hidden = true;
    app.hidden = false;
    window.scrollTo(0, 0);
    location.hash = '#app/dossier';
    showPage('dossier');
  }

  function showPage(name) {
    if (!PAGES.includes(name)) name = 'dossier';
    $$('[data-nav]').forEach(el => {
      const active = el.dataset.nav === name;
      el.classList.toggle('is-active', active);
      if (active) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
    });
    $$('.page').forEach(p => { p.hidden = p.dataset.page !== name; });
    if (name === 'posta') $('#postaDot').classList.add('is-read');
    document.title = `${PAGE_TITLES[name]} · Fundstore`;
    window.scrollTo({ top: 0 });
  }

  $$('[data-nav]').forEach(el => el.addEventListener('click', () => {
    const target = `#app/${el.dataset.nav}`;
    if (location.hash !== target) location.hash = target;
  }));

  window.addEventListener('hashchange', () => {
    if (!location.hash.startsWith('#app')) return;
    if (app.hidden) { fillUser(); signup.hidden = true; app.hidden = false; }
    showPage(location.hash.split('/')[1]);
  });

  /* ---------- Tabs ---------- */
  $$('[data-tabs]').forEach(group => {
    const tabs = $$('[role="tab"]', group);
    const select = tab => {
      tabs.forEach(t => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        $(`[data-panel="${t.dataset.tab}"]`, group).hidden = !on;
      });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
        select(next);
        next.focus();
      });
    });
  });

  /* ---------- Fondi · search (active, no results by design) ---------- */
  const search = $('.search');
  const searchInput = $('#fundSearch');
  searchInput.addEventListener('input', () => search.classList.toggle('has-value', !!searchInput.value));
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
  $('.search__clear').addEventListener('click', () => {
    searchInput.value = '';
    search.classList.remove('has-value');
    searchInput.focus();
  });

  /* ---------- Posta · checkboxes (messages cannot be opened) ---------- */
  const checkAll = $('[data-check="all"]');
  const checkItems = $$('[data-check="item"]');
  const setCheck = (el, on) => {
    el.setAttribute('aria-checked', String(on));
  };
  checkAll.addEventListener('click', () => {
    const on = checkAll.getAttribute('aria-checked') !== 'true';
    [checkAll, ...checkItems].forEach(el => setCheck(el, on));
  });
  checkItems.forEach(el => el.addEventListener('click', () => {
    setCheck(el, el.getAttribute('aria-checked') !== 'true');
    setCheck(checkAll, checkItems.every(i => i.getAttribute('aria-checked') === 'true'));
  }));

  /* ---------- Esperti ---------- */
  const expertsGrid = $('#experts');

  expertsGrid.innerHTML = EXPERTS.map((x, i) => {
    const initials = x.name.replace('Dr.ssa ', '').split(' ').map(w => w[0]).slice(0, 2).join('');
    const avatar = x.photo
      ? `<div class="expert__avatar" role="img" aria-label="${esc(x.name)}" style="background-image:url('${x.photo}')"></div>`
      : `<div class="expert__avatar" aria-hidden="true">${initials}</div>`;
    return `
      <article class="card expert" data-index="${i}">
        <div class="expert__band${x.band === 'pearl' ? ' expert__band--pearl' : ''}"></div>
        ${avatar}
        <div class="expert__body">
          <h3 class="expert__name">${esc(x.name)}</h3>
          <p class="expert__role">${esc(x.role)}</p>
          <div class="expert__mark" aria-hidden="true">“</div>
          <p class="expert__quote">${esc(x.quote)}</p>
          <div class="expert__meta">
            <span><i class="ph-duotone ph-globe-hemisphere-west" aria-hidden="true"></i>${esc(x.langs)}</span>
            <span><i class="ph ph-bookmark-simple" aria-hidden="true"></i>${esc(x.focus)}</span>
          </div>
          <button type="button" class="btn-sm btn-sm--outline" disabled>Incontra ${esc(x.first)}</button>
        </div>
      </article>`;
  }).join('');

  const chipsWrap = $('#keywordChips');
  chipsWrap.innerHTML = KEYWORDS.map(k =>
    `<button type="button" class="chip chip--edge" aria-pressed="false" data-keyword="${esc(k)}"><i class="ph-bold ph-check" aria-hidden="true"></i>${esc(k)}</button>`
  ).join('');

  const cards = $$('.expert', expertsGrid);
  cards.forEach(c => c.addEventListener('animationend', () => {
    if (c.classList.contains('is-entering')) { c.classList.remove('is-entering'); c.style.animationDelay = ''; }
  }));
  const filterStatus = $('#filterStatus');
  let activeKeyword = null;
  let filterRun = 0;

  async function applyFilter(keyword) {
    activeKeyword = keyword;
    const run = ++filterRun;
    $$('.chip', chipsWrap).forEach(c => {
      const on = c.dataset.keyword === keyword;
      c.classList.toggle('is-selected', on);
      c.setAttribute('aria-pressed', String(on));
    });

    const matches = cards.filter((c, i) => !keyword || EXPERTS[i].tags.includes(keyword));
    const leaving = cards.filter(c => !c.hidden && !matches.includes(c));

    $('span', filterStatus).textContent = keyword
      ? `${matches.length} ${matches.length === 1 ? 'esperto' : 'esperti'} per «${keyword}»`
      : '';
    filterStatus.classList.toggle('is-visible', !!keyword);

    leaving.forEach(c => { c.classList.remove('is-entering'); c.classList.add('is-leaving'); });
    if (leaving.length) await wait(180);
    if (run !== filterRun) return;

    cards.forEach(c => {
      const show = matches.includes(c);
      c.classList.remove('is-leaving', 'is-entering');
      c.hidden = !show;
    });
    matches.forEach((c, i) => {
      void c.offsetWidth;
      c.style.animationDelay = `${i * 45}ms`;
      c.classList.add('is-entering');
    });
  }

  chipsWrap.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    applyFilter(chip.dataset.keyword === activeKeyword ? null : chip.dataset.keyword);
  });
  $('#filterReset').addEventListener('click', () => applyFilter(null));

  /* ---------- Activation modal ---------- */
  const modal = $('#activation');
  let lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.classList.remove('is-leaving');
    document.documentElement.style.overflow = 'hidden';
    $('.modal__close', modal).focus();
  }
  async function closeModal() {
    if (modal.hidden || modal.classList.contains('is-leaving')) return;
    modal.classList.add('is-leaving');
    await wait(200);
    modal.hidden = true;
    modal.classList.remove('is-leaving');
    document.documentElement.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  $$('[data-activate]').forEach(btn => btn.addEventListener('click', openModal));
  $('.modal__close', modal).addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') {
      const focusables = $$('button', modal);
      const i = focusables.indexOf(document.activeElement);
      const next = focusables[(i + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length];
      e.preventDefault();
      next.focus();
    }
  });

  /* ---------- Deep link straight into the account area (e.g. #app/esperti) ---------- */
  if (location.hash.startsWith('#app')) {
    fillUser();
    signup.hidden = true;
    app.hidden = false;
    showPage(location.hash.split('/')[1]);
  }
})();
