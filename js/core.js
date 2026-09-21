/* Fundstore onboarding prototype · shared helpers and state (loaded first) */
window.FS = (() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, reduceMotion ? 0 : ms));
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Filled in by the sign-up form; the account area falls back to "Edoardo Bizzarri".
  const user = { nome: '', cognome: '', email: '' };

  // Registered by app.js; called by signup.js when the password is set.
  const enterApp = () => {};

  // Placeholder for mock data (see js/data/).
  const data = {};

  return { $, $$, reduceMotion, wait, esc, user, enterApp, data };
})();
