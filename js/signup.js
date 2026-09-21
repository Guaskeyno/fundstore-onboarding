/* Fundstore onboarding prototype · sign-up pages
   signup.xhtml (method) → signup-details.xhtml (name, surname, email) → signup-password.xhtml → dossier.xhtml
   Requires jQuery 3.7.1, js/core.js and js/forms.js (validation + submit live there). */
(function ($, FS) {
  'use strict';

  FS.flag('seenSignup', true);

  /* ---------- Toasts ---------- */
  function toast(message, options) {
    var opts = $.extend({ variant: 'success', timeout: 8000 }, options);
    var icon = opts.variant === 'info' ? 'ph-info' : 'ph-check-circle';
    var $toast = $(
      '<div class="toast' + (opts.variant === 'info' ? ' toast--info' : '') + '">' +
        '<i class="ph ' + icon + '" aria-hidden="true"></i>' +
        '<span class="toast__text">' + FS.esc(message) + '</span>' +
        '<a class="toast__close" href="#" role="button" aria-label="Chiudi notifica"><i class="ph ph-x" aria-hidden="true"></i></a>' +
      '</div>'
    );
    var timer;

    function dismiss() {
      clearTimeout(timer);
      $toast.addClass('is-leaving').one('animationend', function () { $toast.remove(); });
    }
    function arm() { timer = setTimeout(dismiss, opts.timeout); }

    $toast.on('click', '.toast__close', function (e) { e.preventDefault(); dismiss(); })
      .on('mouseenter', function () { clearTimeout(timer); })
      .on('mouseleave', arm);
    $('.toast-region').empty().append($toast);
    arm();
  }

  /* ---------- Out-of-scope links (Google, Termini, Privacy, Accedi) ---------- */
  $(document).on('click', '[data-action="google"]', function (e) {
    e.preventDefault();
    toast('Accesso con Google non disponibile in questo prototipo', { variant: 'info', timeout: 4000 });
  });
  $(document).on('click', '[data-unavailable]', function (e) {
    e.preventDefault();
    toast('Pagina non disponibile in questo prototipo', { variant: 'info', timeout: 4000 });
  });

  /* ---------- Show / hide password (any number of password fields) ---------- */
  $(document).on('click', '.control__toggle', function (e) {
    e.preventDefault();
    var $input = $(this).closest('.control').find('.input');
    var show = $input.attr('type') === 'password';
    $input.attr('type', show ? 'text' : 'password').trigger('focus');
    $(this).attr({ 'aria-pressed': String(show), 'aria-label': show ? 'Nascondi password' : 'Mostra password' })
      .find('i').attr('class', 'ph ' + (show ? 'ph-eye-slash' : 'ph-eye'));
  });

  /* ---------- On arrival ---------- */
  $(function () {
    // Put the cursor in the first field of the page's form.
    var first = $('.js-form .input').get(0);
    if (first) first.focus({ preventScroll: true });

    // Message to show on arrival, e.g. "Email verificata" on signup-password.xhtml (Figma screen 3).
    var message = $('body').attr('data-toast');
    if (message) FS.wait(250).then(function () { toast(message); });
  });
})(jQuery, window.FS);
