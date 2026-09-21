/* Fundstore onboarding prototype · form fields, validation and submit
   Requires jQuery 3.7.1 and js/core.js.

   Everything here works on GROUPS of fields found by class / data attribute — never by id
   (JSF prefixes ids, e.g. "form:nome"), and no field is listed one by one.
   A new field only needs the right markup; no JavaScript changes.

   Markup contract
   ---------------
   .js-form                               a group of fields submitted together (<h:form styleClass="js-form">)
     .field[data-field][data-validate]    one field
         data-field      key of the value in FS.forms.values(), e.g. "nome"
         data-validate   rule in FS.forms.rules: name | email | password | confirm
         data-label      (name rule) the word used in messages: "Inserisci il tuo {label}"
         data-match      (confirm rule) data-field of the field it must equal
       .input                             the input (<h:inputText styleClass="input">)
       .error em                          where the error message goes (optional)
       .rule                              live requirement indicator, e.g. "almeno 8 caratteri" (optional)
     .reveal                              optional: slides the action in once every field is filled
     .js-submit                           the action link (<h:commandLink styleClass="... js-submit">)

   Submitting with <h:commandLink>
   -------------------------------
   <h:commandLink> submits through its own onclick. A capture-phase listener validates the group
   BEFORE that onclick runs and stops the click when a field is invalid, so an invalid form never
   reaches the server. When the group is valid the click continues untouched to JSF.
   Alternatively, chain it explicitly: <h:commandLink onclick="return FS.forms.check(this);">.

   PROTOTYPE ONLY: links with data-prototype-next="page.xhtml" are handled here instead (loading
   state, then navigation), because there is no server. Remove the attribute in the JSF pages. */
window.FS.forms = (function ($, FS) {
  'use strict';

  var NAME_RE = /^[\p{L}][\p{L}\p{M}' .-]*$/u;
  var EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;
  var MIN_PASSWORD = 8;

  /* ---------- Rules: return '' when valid, otherwise the message to show ---------- */
  var rules = {
    name: function (value, $field) {
      var label = $field.attr('data-label') || 'nome';
      if (!value) return 'Inserisci il tuo ' + label;
      if (!NAME_RE.test(value)) return 'Il ' + label + ' può contenere solo lettere';
      if (value.length < 2) return 'Il ' + label + ' deve avere almeno 2 caratteri';
      return '';
    },
    email: function (value) {
      if (!value) return 'Inserisci il tuo indirizzo email';
      if (value.indexOf('@') === -1) return 'L’indirizzo email deve contenere una @';
      if (!EMAIL_RE.test(value)) return 'Inserisci un indirizzo email valido (es. nome@dominio.it)';
      return '';
    },
    password: function (value) {
      return value.length >= MIN_PASSWORD ? '' : 'La password deve avere almeno ' + MIN_PASSWORD + ' caratteri';
    },
    confirm: function (value, $field, $group) {
      if (!value) return 'Conferma la password';
      return value === valueOf($group, $field.attr('data-match')) ? '' : 'Le password non coincidono';
    }
  };

  /* ---------- Reading fields ---------- */
  function groupOf(el) { return $(el).closest('.js-form'); }
  function fieldsOf($group) { return $group.find('.field[data-validate]'); }
  function inputOf($field) { return $field.find('.input'); }

  // Passwords are compared as typed; every other value is trimmed.
  function read($field) {
    var value = inputOf($field).val() || '';
    return /^(password|confirm)$/.test($field.attr('data-validate')) ? value : $.trim(value);
  }
  function valueOf($group, key) {
    return read($group.find('.field[data-field="' + key + '"]'));
  }
  function errorOf($field, $group) {
    var rule = rules[$field.attr('data-validate')];
    return rule ? rule(read($field), $field, $group || groupOf($field)) : '';
  }

  // All values of a group as { dataField: value }, e.g. { nome: 'Giulia', cognome: 'Rossi', email: '…' }.
  function values($group) {
    var out = {};
    $group.find('.field[data-field]').each(function () {
      out[$(this).attr('data-field')] = read($(this));
    });
    return out;
  }

  /* ---------- Showing state ---------- */
  function setState($field, error) {
    $field.toggleClass('is-invalid', !!error).toggleClass('is-valid', !error);
    inputOf($field).attr('aria-invalid', error ? 'true' : 'false');
    if (error) $field.find('.error em').text(error);
  }

  function flagRule($rule) {
    $rule.removeClass('is-flagged');
    void $rule[0].offsetWidth;          // restart the shake animation
    $rule.addClass('is-flagged');
  }

  function shake($el) {
    $el.removeClass('shake');
    void $el[0].offsetWidth;
    $el.addClass('shake');
  }

  /* ---------- Validating a whole group ---------- */
  function validate($group) {
    var $firstInvalid = null;
    fieldsOf($group).each(function () {
      var $field = $(this);
      var error = errorOf($field, $group);
      var $rule = $field.find('.rule');
      if ($rule.length) {                 // fields with a requirement indicator flag it instead of a message
        $rule.toggleClass('is-met', !error);
        if (error) flagRule($rule);
        $field.toggleClass('is-invalid', !!error);
      } else {
        setState($field, error);
      }
      if (error && !$firstInvalid) $firstInvalid = $field;
    });
    if ($firstInvalid) {
      shake($firstInvalid.find('.rule').length ? $firstInvalid.find('.rule') : $group);
      inputOf($firstInvalid).trigger('focus');
      return false;
    }
    return true;
  }

  // Every field has a value and every requirement indicator is met.
  function isReady($group) {
    var ready = true;
    fieldsOf($group).each(function () {
      if (!read($(this))) ready = false;
    });
    $group.find('.rule').each(function () {
      if (!$(this).hasClass('is-met')) ready = false;
    });
    return ready;
  }

  /* ---------- Live feedback (delegated: works for any number of fields) ---------- */
  $(document)
    // Leaving a field that has a value: validate it.
    .on('blur', '.js-form .field[data-validate] .input', function () {
      var $field = $(this).closest('.field');
      if (!read($field) || $field.find('.rule').length) return;
      setState($field, errorOf($field));
    })
    .on('input', '.js-form .field[data-validate] .input', function () {
      var $field = $(this).closest('.field');
      var $group = groupOf($field);
      var $rule = $field.find('.rule');

      if ($rule.length) {
        // Requirement indicator follows the typing ("almeno 8 caratteri").
        var met = !errorOf($field, $group);
        $rule.toggleClass('is-met', met);
        if (met) { $rule.removeClass('is-flagged'); $field.removeClass('is-invalid'); }
      } else if ($field.is('.is-invalid, .is-valid') && !$field.is('[data-match]')) {
        // Once a field has been judged, re-check it while typing.
        var error = errorOf($field, $group);
        if (!error) setState($field, '');
        else $field.removeClass('is-valid');
      }

      // Fields that must match another field (confirm password): judge them as soon as they are long enough.
      $group.find('.field[data-match]').each(function () {
        var $match = $(this);
        var value = read($match);
        var other = valueOf($group, $match.attr('data-match'));
        if (!value) { $match.removeClass('is-invalid is-valid'); return; }
        if (value === other) setState($match, '');
        else if (value.length >= other.length || $match.hasClass('is-invalid')) setState($match, errorOf($match, $group));
        else $match.removeClass('is-valid');
      });

      // Slide the action in once the group is complete.
      var ready = isReady($group);
      $group.find('.reveal').toggleClass('is-open', ready)
        .find('.js-submit').attr('tabindex', ready ? '0' : '-1');
    })
    // Enter in any field triggers the group's action link (links don't submit forms on Enter).
    .on('keydown', '.js-form .input', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      var link = groupOf(this).find('.js-submit').get(0);
      if (link) link.click();
    })
    // PROTOTYPE ONLY: there is no server to post to.
    .on('submit', '.js-form', function (e) { e.preventDefault(); });

  /* ---------- Submit: validate before <h:commandLink>'s own onclick ----------
     jQuery cannot listen in the capture phase, so this one listener is plain DOM. */
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('.js-submit') : null;
    if (!link) return;
    var $group = groupOf(link);

    if (!validate($group)) {
      e.preventDefault();
      e.stopImmediatePropagation();       // the click never reaches JSF
      return;
    }
    $group.trigger('fs:valid', [values($group), link]);

    // PROTOTYPE ONLY: fake the round trip to the server.
    var next = link.getAttribute('data-prototype-next');
    if (next) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if ($group.attr('data-store') === 'user') FS.saveUser(values($group));
      $(link).addClass('is-loading');
      FS.wait(900).then(function () { FS.go(next); });
    }
  }, true);

  return {
    rules: rules,
    // Accept the .js-form itself or any element inside it.
    values: function (el) { return values($(el).is('.js-form') ? $(el) : groupOf(el)); },
    validate: function (el) { return validate($(el).is('.js-form') ? $(el) : groupOf(el)); },
    // For <h:commandLink onclick="return FS.forms.check(this);">
    check: function (link) { return validate(groupOf(link)); }
  };
})(jQuery, window.FS);
