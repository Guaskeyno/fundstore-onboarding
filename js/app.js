/* Fundstore onboarding prototype · account area
   Runs on every account page (dossier, fondi, movimenti, ordini, esperti, posta, approfondimenti, profilo).
   Each block only wires up the markup present on the current page. */
(() => {
  const { $, $$, wait, user, esc, flag } = window.FS;
  const pageId = document.body.getAttribute('data-page');

  flag('seenApp', true);

  /* ---------- Name from the sign-up form ---------- */
  const nome = user.nome || 'Edoardo';
  const cognome = user.cognome || 'Bizzarri';
  $$('[data-user="firstname"]').forEach(el => { el.textContent = nome; });
  $$('[data-user="fullname"]').forEach(el => { el.textContent = `${nome} ${cognome}`; });
  $$('[data-user="initials"]').forEach(el => { el.textContent = (nome[0] + cognome[0]).toUpperCase(); });

  /* ---------- Posta unread dot: disappears the first time Posta is opened ---------- */
  const postaDot = $('#postaDot');
  if (postaDot) {
    const onPosta = pageId === 'posta' || pageId === 'approfondimenti';
    if (flag('postaRead')) {
      postaDot.hidden = true;
    } else if (onPosta) {
      flag('postaRead', true);
      wait(400).then(() => postaDot.classList.add('is-read'));
    }
  }

  /* ---------- Fondi · search (active, no results by design) ---------- */
  const search = $('.search');
  if (search) {
    const searchInput = $('#fundSearch');
    searchInput.addEventListener('input', () => search.classList.toggle('has-value', !!searchInput.value));
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
    $('.search__clear').addEventListener('click', () => {
      searchInput.value = '';
      search.classList.remove('has-value');
      searchInput.focus();
    });
  }

  /* ---------- Posta · checkboxes (messages cannot be opened) ---------- */
  const checkAll = $('[data-check="all"]');
  if (checkAll) {
    const checkItems = $$('[data-check="item"]');
    const setCheck = (el, on) => el.setAttribute('aria-checked', String(on));
    checkAll.addEventListener('click', () => {
      const on = checkAll.getAttribute('aria-checked') !== 'true';
      [checkAll, ...checkItems].forEach(el => setCheck(el, on));
    });
    checkItems.forEach(el => el.addEventListener('click', () => {
      setCheck(el, el.getAttribute('aria-checked') !== 'true');
      setCheck(checkAll, checkItems.every(i => i.getAttribute('aria-checked') === 'true'));
    }));
  }

  /* ---------- Esperti · cards + keyword filter (data in js/data/experts.js) ---------- */
  const expertsGrid = $('#experts');
  if (expertsGrid) {
    const { KEYWORDS, EXPERTS } = window.FS.data;

    // Markup is injected as XML (the page is served as application/xhtml+xml), so it must stay well-formed.
    expertsGrid.innerHTML = EXPERTS.map((x, i) => {
      const initials = x.name.replace('Dr.ssa ', '').split(' ').map(w => w[0]).slice(0, 2).join('');
      const avatar = x.photo
        ? `<div class="expert__avatar" role="img" aria-label="${esc(x.name)}" style="background-image:url('${esc(x.photo)}')"></div>`
        : `<div class="expert__avatar" aria-hidden="true">${esc(initials)}</div>`;
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
            <button type="button" class="btn-sm btn-sm--outline" disabled="disabled">Incontra ${esc(x.first)}</button>
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

    const applyFilter = async keyword => {
      activeKeyword = keyword;
      const run = ++filterRun;
      $$('.chip', chipsWrap).forEach(c => {
        const on = c.getAttribute('data-keyword') === keyword;
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
        c.classList.remove('is-leaving', 'is-entering');
        c.hidden = !matches.includes(c);
      });
      matches.forEach((c, i) => {
        void c.offsetWidth;
        c.style.animationDelay = `${i * 45}ms`;
        c.classList.add('is-entering');
      });
    };

    chipsWrap.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const keyword = chip.getAttribute('data-keyword');
      applyFilter(keyword === activeKeyword ? null : keyword);
    });
    $('#filterReset').addEventListener('click', () => applyFilter(null));
  }

  /* ---------- Activation modal (every account page) ---------- */
  const modal = $('#activation');
  if (modal) {
    let lastFocus = null;

    const openModal = () => {
      lastFocus = document.activeElement;
      modal.hidden = false;
      modal.classList.remove('is-leaving');
      document.documentElement.style.overflow = 'hidden';
      $('.modal__close', modal).focus();
    };
    const closeModal = async () => {
      if (modal.hidden || modal.classList.contains('is-leaving')) return;
      modal.classList.add('is-leaving');
      await wait(200);
      modal.hidden = true;
      modal.classList.remove('is-leaving');
      document.documentElement.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

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
  }
})();
