/* Fundstore onboarding prototype · shared helpers and state
   Loaded in <head> on every page, before signup.js / app.js. */
window.FS = (() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, reduceMotion ? 0 : ms));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Session state (survives page loads, cleared when the tab closes) ---------- */
  const PREFIX = 'fundstore.prototype.';
  const read = key => {
    try { return JSON.parse(sessionStorage.getItem(PREFIX + key)); } catch (e) { return null; }
  };
  const store = (key, value) => {
    try { sessionStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* private mode: state just won't persist */ }
  };

  // Filled in by the sign-up form; the account area falls back to "Edoardo Bizzarri".
  const user = Object.assign({ nome: '', cognome: '', email: '' }, read('user'));
  const saveUser = () => store('user', user);

  // One-off flags, e.g. "posta has been read", "the account area has been seen".
  const flag = (name, value) => (value === undefined ? read('flag.' + name) === true : store('flag.' + name, value));

  // Navigate with a short exit fade (the next page fades itself in).
  const go = async url => {
    document.documentElement.classList.add('fs-leaving');
    await wait(200);
    location.href = url;
  };

  // Returning to the account area: skip the one-time entrance animations (banner slide, wave, chat pop).
  if (flag('seenApp')) document.documentElement.classList.add('fs-returning');
  if (flag('seenSignup')) document.documentElement.classList.add('fs-returning-signup');

  return { $, $$, reduceMotion, wait, esc, user, saveUser, flag, go, data: {} };
})();
