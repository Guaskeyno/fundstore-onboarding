/* Fundstore onboarding prototype · sign-up journey: method → details → password */
(() => {
  const { $, $$, wait, user } = window.FS;
  const title = $('#title');

  /* ---------- Step navigation ---------- */
  async function goTo(name, { titleText = 'Registrati a Fundstore' } = {}) {
    const current = $('.step.is-active');
    const next = $(`[data-step="${name}"]`);
    const titleChanges = title.textContent !== titleText;

    if (current) {
      current.classList.add('is-leaving');
      if (titleChanges) title.classList.add('is-swapping');
      await wait(180);
      current.classList.remove('is-active', 'is-leaving');
      current.hidden = true;
    }
    if (titleChanges) {
      title.textContent = titleText;
      title.classList.remove('is-swapping');
      title.classList.add('is-entering');
      title.addEventListener('animationend', () => title.classList.remove('is-entering'), { once: true });
    }
    next.hidden = false;
    next.classList.add('is-active');
    const first = $('input', next);
    if (first) first.focus({ preventScroll: true });
  }

  function shake(el) {
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }

  /* ---------- Toasts ---------- */
  const toastRegion = $('#toastRegion');
  function toast(message, { variant = 'success', timeout = 8000 } = {}) {
    toastRegion.innerHTML = '';
    const el = document.createElement('div');
    el.className = `toast${variant === 'info' ? ' toast--info' : ''}`;
    el.innerHTML = `
      <i class="ph ${variant === 'info' ? 'ph-info' : 'ph-check-circle'}" aria-hidden="true"></i>
      <span class="toast__text"></span>
      <button type="button" class="toast__close" aria-label="Chiudi notifica"><i class="ph ph-x"></i></button>`;
    $('.toast__text', el).textContent = message;
    toastRegion.append(el);

    let timer;
    const dismiss = () => {
      clearTimeout(timer);
      el.classList.add('is-leaving');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    };
    const arm = () => { timer = setTimeout(dismiss, timeout); };
    $('.toast__close', el).addEventListener('click', dismiss);
    el.addEventListener('mouseenter', () => clearTimeout(timer));
    el.addEventListener('mouseleave', arm);
    arm();
  }

  /* ---------- Field helpers ---------- */
  function setFieldState(field, error, { showValid = true } = {}) {
    const input = $('input', field);
    const msg = $('.error em', field);
    field.classList.toggle('is-invalid', !!error);
    field.classList.toggle('is-valid', !error && showValid);
    input.setAttribute('aria-invalid', error ? 'true' : 'false');
    if (error && msg) msg.textContent = error;
  }

  /* ---------- Step 1 ---------- */
  $('[data-action="email"]').addEventListener('click', () => goTo('details'));
  $('[data-action="google"]').addEventListener('click', () =>
    toast('Accesso con Google non disponibile in questo prototipo', { variant: 'info', timeout: 4000 }));

  $$('[data-unavailable]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    toast('Pagina non disponibile in questo prototipo', { variant: 'info', timeout: 4000 });
  }));

  /* ---------- Step 2 · details ---------- */
  const detailsForm = $('#detailsForm');
  const NAME_RE = /^[\p{L}][\p{L}\p{M}' .-]*$/u;
  const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

  const validators = {
    nome(v) {
      if (!v) return 'Inserisci il tuo nome';
      if (!NAME_RE.test(v)) return 'Il nome può contenere solo lettere';
      if (v.length < 2) return 'Il nome deve avere almeno 2 caratteri';
      return '';
    },
    cognome(v) {
      if (!v) return 'Inserisci il tuo cognome';
      if (!NAME_RE.test(v)) return 'Il cognome può contenere solo lettere';
      if (v.length < 2) return 'Il cognome deve avere almeno 2 caratteri';
      return '';
    },
    email(v) {
      if (!v) return 'Inserisci il tuo indirizzo email';
      if (!v.includes('@')) return 'L’indirizzo email deve contenere una @';
      if (!EMAIL_RE.test(v)) return 'Inserisci un indirizzo email valido (es. nome@dominio.it)';
      return '';
    }
  };

  function validateDetail(name) {
    const field = $(`[data-field="${name}"]`, detailsForm);
    const value = $('input', field).value.trim();
    const error = validators[name](value);
    setFieldState(field, error);
    return !error;
  }

  Object.keys(validators).forEach(name => {
    const field = $(`[data-field="${name}"]`, detailsForm);
    const input = $('input', field);
    // Validate when leaving a field the user has typed in…
    input.addEventListener('blur', () => { if (input.value.trim()) validateDetail(name); });
    // …and re-check live once a field has been flagged or confirmed.
    input.addEventListener('input', () => {
      if (field.classList.contains('is-invalid') || field.classList.contains('is-valid')) {
        const error = validators[name](input.value.trim());
        if (!error) setFieldState(field, '');
        else if (field.classList.contains('is-valid')) field.classList.remove('is-valid');
      }
    });
  });

  detailsForm.addEventListener('submit', async e => {
    e.preventDefault();
    const results = Object.keys(validators).map(validateDetail);
    if (results.includes(false)) {
      shake(detailsForm);
      $('.field.is-invalid input', detailsForm).focus();
      return;
    }
    user.nome = $('#nome').value.trim();
    user.cognome = $('#cognome').value.trim();
    user.email = $('#email').value.trim();

    const btn = $('button[type="submit"]', detailsForm);
    btn.classList.add('is-loading');
    await wait(800);
    btn.classList.remove('is-loading');
    await goTo('password');
    toast('Email verificata');
  });

  /* ---------- Step 3/4 · password ---------- */
  const pwForm = $('#passwordForm');
  const pw = $('#password');
  const confirm = $('#confirm');
  const rule = $('#pw-rule');
  const confirmField = $('[data-field="confirm"]');
  const reveal = $('#pwReveal');
  const pwSubmit = $('#pwSubmit');

  function updatePassword() {
    const met = pw.value.length >= 8;
    if (met !== rule.classList.contains('is-met')) rule.classList.toggle('is-met', met);
    if (met) rule.classList.remove('is-flagged');

    const open = met && confirm.value.length > 0;
    reveal.classList.toggle('is-open', open);
    pwSubmit.tabIndex = open ? 0 : -1;

    // Live match feedback once the confirmation is as long as the password
    if (!confirm.value) {
      confirmField.classList.remove('is-invalid', 'is-valid');
    } else if (confirm.value === pw.value && met) {
      setFieldState(confirmField, '');
    } else if (confirm.value.length >= pw.value.length || confirmField.classList.contains('is-invalid')) {
      setFieldState(confirmField, 'Le password non coincidono');
    } else {
      confirmField.classList.remove('is-valid');
    }
  }
  pw.addEventListener('input', updatePassword);
  confirm.addEventListener('input', updatePassword);
  confirm.addEventListener('blur', () => {
    if (confirm.value && confirm.value !== pw.value) setFieldState(confirmField, 'Le password non coincidono');
  });

  $$('[data-toggle]').forEach(btn => btn.addEventListener('click', () => {
    const input = $('#' + btn.dataset.toggle);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-pressed', String(show));
    btn.setAttribute('aria-label', show ? 'Nascondi password' : 'Mostra password');
    $('i', btn).className = `ph ${show ? 'ph-eye-slash' : 'ph-eye'}`;
    input.focus();
  }));

  pwForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (pw.value.length < 8) {
      rule.classList.remove('is-flagged');
      void rule.offsetWidth;
      rule.classList.add('is-flagged');
      pw.focus();
      return;
    }
    if (confirm.value !== pw.value) {
      setFieldState(confirmField, 'Le password non coincidono');
      shake(confirmField);
      confirm.focus();
      return;
    }
    pwSubmit.classList.add('is-loading');
    await wait(1100);
    FS.enterApp();
  });
})();
