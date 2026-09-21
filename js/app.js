/* Fundstore onboarding prototype · account pages
   dossier, fondi, movimenti, ordini, esperti, posta, approfondimenti, profilo.
   Requires jQuery 3.7.1 and js/core.js. Every block works on classes / data attributes, so it only
   does something on the pages that contain the matching markup. */
(function ($, FS) {
  'use strict';

  var page = $('body').attr('data-page');
  FS.flag('seenApp', true);

  /* ---------- Name from the sign-up form (PROTOTYPE ONLY: rendered by the server in production) ---------- */
  var nome = FS.user.nome || 'Edoardo';
  var cognome = FS.user.cognome || 'Bizzarri';
  $('[data-user="firstname"]').text(nome);
  $('[data-user="fullname"]').text(nome + ' ' + cognome);
  $('[data-user="initials"]').text((nome.charAt(0) + cognome.charAt(0)).toUpperCase());

  /* ---------- Posta unread dot: disappears the first time Posta is opened ---------- */
  $('.nav__dot').each(function () {
    var $dot = $(this);
    if (FS.flag('postaRead')) {
      $dot.prop('hidden', true);
    } else if (page === 'posta' || page === 'approfondimenti') {
      FS.flag('postaRead', true);
      FS.wait(400).then(function () { $dot.addClass('is-read'); });
    }
  });

  /* ---------- Fondi · search (active, no results by design) ---------- */
  $(document)
    .on('input', '.search__input', function () {
      $(this).closest('.search').toggleClass('has-value', !!this.value);
    })
    .on('keydown', '.search__input', function (e) {
      if (e.key === 'Enter') e.preventDefault();
    })
    .on('click', '.search__clear', function (e) {
      e.preventDefault();
      var $search = $(this).closest('.search').removeClass('has-value');
      $search.find('.search__input').val('').trigger('focus');
    });

  /* ---------- Checkboxes: a "select all" plus items, grouped by their card ---------- */
  $(document).on('click', '.check', function (e) {
    e.preventDefault();
    var $check = $(this);
    var $scope = $check.closest('.card');
    var $all = $scope.find('.check[data-check="all"]');
    var $items = $scope.find('.check[data-check="item"]');

    if ($check.is($all)) {
      var on = $check.attr('aria-checked') !== 'true';
      $all.add($items).attr('aria-checked', String(on));
    } else {
      $check.attr('aria-checked', String($check.attr('aria-checked') !== 'true'));
      $all.attr('aria-checked', String($items.filter('[aria-checked="true"]').length === $items.length));
    }
  });

  /* ---------- Esperti · cards + keyword filter (data in js/data/experts.js) ---------- */
  $('.experts').each(function () {
    var $grid = $(this);
    var experts = FS.data.EXPERTS || [];
    var keywords = FS.data.KEYWORDS || [];
    var $chips = $('.keyword-chips');
    var $status = $('.filter-status');
    var activeKeyword = null;
    var filterRun = 0;

    // Built as strings and parsed as XML (the page is application/xhtml+xml): keep it well-formed.
    $grid.html($.map(experts, function (x, i) {
      var initials = $.map(x.name.replace('Dr.ssa ', '').split(' '), function (w) { return w.charAt(0); }).slice(0, 2).join('');
      var avatar = x.photo
        ? '<div class="expert__avatar" role="img" aria-label="' + FS.esc(x.name) + '" style="background-image:url(\'' + FS.esc(x.photo) + '\')"></div>'
        : '<div class="expert__avatar" aria-hidden="true">' + FS.esc(initials) + '</div>';
      return '' +
        '<article class="card expert" data-index="' + i + '">' +
          '<div class="expert__band' + (x.band === 'pearl' ? ' expert__band--pearl' : '') + '"></div>' +
          avatar +
          '<div class="expert__body">' +
            '<h3 class="expert__name">' + FS.esc(x.name) + '</h3>' +
            '<p class="expert__role">' + FS.esc(x.role) + '</p>' +
            '<div class="expert__mark" aria-hidden="true">“</div>' +
            '<p class="expert__quote">' + FS.esc(x.quote) + '</p>' +
            '<div class="expert__meta">' +
              '<span><i class="ph-duotone ph-globe-hemisphere-west" aria-hidden="true"></i>' + FS.esc(x.langs) + '</span>' +
              '<span><i class="ph ph-bookmark-simple" aria-hidden="true"></i>' + FS.esc(x.focus) + '</span>' +
            '</div>' +
            // Deactivated in the prototype: rendered like <h:commandLink disabled="true">
            '<span class="btn-sm btn-sm--outline" aria-disabled="true">Incontra ' + FS.esc(x.first) + '</span>' +
          '</div>' +
        '</article>';
    }).join(''));

    $chips.html($.map(keywords, function (k) {
      return '<a class="chip chip--edge" href="#" role="button" aria-pressed="false" data-keyword="' + FS.esc(k) + '">' +
        '<i class="ph-bold ph-check" aria-hidden="true"></i>' + FS.esc(k) + '</a>';
    }).join(''));

    var $cards = $grid.children('.expert');
    $cards.on('animationend', function () {
      if ($(this).hasClass('is-entering')) $(this).removeClass('is-entering').css('animation-delay', '');
    });

    function applyFilter(keyword) {
      var run = ++filterRun;
      activeKeyword = keyword;

      $chips.children('.chip').each(function () {
        var on = $(this).attr('data-keyword') === keyword;
        $(this).toggleClass('is-selected', on).attr('aria-pressed', String(on));
      });

      var $matches = $cards.filter(function () {
        return !keyword || $.inArray(keyword, experts[$(this).attr('data-index')].tags) > -1;
      });
      var $leaving = $cards.filter(function () { return !this.hidden; }).not($matches);

      $status.find('span').text(keyword
        ? $matches.length + ($matches.length === 1 ? ' esperto' : ' esperti') + ' per «' + keyword + '»'
        : '');
      $status.toggleClass('is-visible', !!keyword);

      $leaving.removeClass('is-entering').addClass('is-leaving');
      return FS.wait($leaving.length ? 180 : 0).then(function () {
        if (run !== filterRun) return;
        $cards.removeClass('is-leaving is-entering').each(function () {
          this.hidden = !$matches.is(this);
        });
        $matches.each(function (i) {
          void this.offsetWidth;
          $(this).css('animation-delay', (i * 45) + 'ms').addClass('is-entering');
        });
      });
    }

    $chips.on('click', '.chip', function (e) {
      e.preventDefault();
      var keyword = $(this).attr('data-keyword');
      applyFilter(keyword === activeKeyword ? null : keyword);
    });
    $status.on('click', '.filter-reset', function (e) {
      e.preventDefault();
      applyFilter(null);
    });
  });

  /* ---------- Activation modal (every account page) ---------- */
  $('.modal-backdrop').each(function () {
    var $modal = $(this);
    var lastFocus = null;

    function open(e) {
      if (e) e.preventDefault();
      lastFocus = document.activeElement;
      $modal.prop('hidden', false).removeClass('is-leaving');
      $('html').css('overflow', 'hidden');
      $modal.find('.modal__close').trigger('focus');
    }
    function close(e) {
      if (e) e.preventDefault();
      if ($modal.prop('hidden') || $modal.hasClass('is-leaving')) return;
      $modal.addClass('is-leaving');
      FS.wait(200).then(function () {
        $modal.prop('hidden', true).removeClass('is-leaving');
        $('html').css('overflow', '');
        if (lastFocus) lastFocus.focus();
      });
    }

    $(document).on('click', '[data-activate]', open);
    $modal.on('click', '.modal__close', close);
    $(document).on('keydown', function (e) {
      if ($modal.prop('hidden')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {                 // keep focus inside the dialog
        var $focusables = $modal.find('a[href]');
        var i = $focusables.index(document.activeElement);
        e.preventDefault();
        $focusables.eq((i + (e.shiftKey ? -1 : 1) + $focusables.length) % $focusables.length).trigger('focus');
      }
    });
  });
})(jQuery, window.FS);
