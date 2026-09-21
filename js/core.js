/* Fundstore onboarding prototype · shared helpers and session state
   Requires jQuery 3.7.1. Loaded in <head> on every page, right after jQuery. */
window.FS = (function ($) {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, reduceMotion ? 0 : ms); });
  }

  // Escape a value before putting it into markup built as a string (pages are parsed as XML).
  function esc(value) {
    return String(value).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------- Session state (PROTOTYPE ONLY: in production this comes from the server) ----------
     Survives page loads, cleared when the tab closes. */
  var PREFIX = 'fundstore.prototype.';

  function read(key) {
    try { return JSON.parse(sessionStorage.getItem(PREFIX + key)); } catch (e) { return null; }
  }
  function store(key, value) {
    try { sessionStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* private mode */ }
  }

  // Filled in by the sign-up form; the account area falls back to "Edoardo Bizzarri".
  var user = $.extend({ nome: '', cognome: '', email: '' }, read('user'));
  function saveUser(values) {
    $.extend(user, values);
    store('user', user);
  }

  // One-off flags, e.g. "posta has been read", "the account area has been seen".
  function flag(name, value) {
    if (value === undefined) return read('flag.' + name) === true;
    store('flag.' + name, value);
  }

  // Navigate with a short exit fade (the next page fades itself in).
  function go(url) {
    $('html').addClass('fs-leaving');
    return wait(200).then(function () { window.location.href = url; });
  }

  // Returning visits: skip the one-time entrance animations (banner slide, wave, chat pop, photo fade).
  if (flag('seenApp')) $('html').addClass('fs-returning');
  if (flag('seenSignup')) $('html').addClass('fs-returning-signup');

  /* ---------- Action links ----------
     Every action is a link, as rendered by <h:commandLink>. Links with role="button"/"checkbox"
     should also react to the Space key, like the <button> they replace. */
  $(document).on('keydown', 'a[role="button"], a[role="checkbox"]', function (e) {
    if (e.key === ' ') {
      e.preventDefault();
      this.click();
    }
  });

  // PROTOTYPE ONLY: client-side actions use href="#"; never jump to the top of the page.
  // (<h:commandLink> already returns false from its own onclick.)
  $(document).on('click', 'a[href="#"]', function (e) { e.preventDefault(); });

  return {
    reduceMotion: reduceMotion,
    wait: wait,
    esc: esc,
    user: user,
    saveUser: saveUser,
    flag: flag,
    go: go,
    data: {}
  };
})(jQuery);
