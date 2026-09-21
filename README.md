# Fundstore Onboarding — design prototype

Clickable desktop prototype of the Fundstore sign-up and first-login journey, built from the Figma designs
(file `Fundstore`, frames `signup 1–4`, `landing`, `funds`, `movements`, `orders`, `advisors`, `mail`, `news`,
`settings`, `activation modal`).

**Live:** https://guaskeyno.github.io/fundstore-onboarding/

One XHTML5 file per screen, ready to be turned into JSF/Facelets pages. No build step: plain XHTML, CSS and
JavaScript on jQuery 3.7.1 (the version used in production). Nothing typed into the prototype is sent anywhere.

## Pages

| File | Screen | Figma frame |
| --- | --- | --- |
| `signup.xhtml` | Sign-up · choose method (Google / email) | signup 1 |
| `signup-details.xhtml` | Sign-up · name, surname, email | signup 2 |
| `signup-password.xhtml` | Sign-up · create password (empty and filled states) | signup 3, signup 4 |
| `dossier.xhtml` | Il tuo dossier | landing |
| `fondi.xhtml` | Cerca il nostro catalogo | funds |
| `movimenti.xhtml` | Movimenti e Ordini · Movimenti tab | movements |
| `ordini.xhtml` | Movimenti e Ordini · Ordini tab | orders |
| `esperti.xhtml` | Esperti Fundstore | advisors |
| `posta.xhtml` | Posta · Messaggi tab | mail |
| `approfondimenti.xhtml` | Posta · Approfondimenti per te tab | news |
| `profilo.xhtml` | Profilo | settings |

The activation modal (Figma `activation modal`) is an overlay included at the end of every account page;
it opens from "Completa la registrazione", "Inizia a Investire" and "Attiva il wallet".

`index.html` only exists because GitHub Pages serves `index.html` by default: it forwards to `signup.xhtml`
(and maps links from the earlier single-page version, e.g. `#app/esperti`, to the matching page).

## XHTML

- Every page is XHTML5: `<?xml … ?>` declaration, `<!DOCTYPE html>`, `xmlns="http://www.w3.org/1999/xhtml"`,
  all elements closed (`<img … />`), all attributes quoted, boolean attributes written out
  (`disabled="disabled"`, `hidden="hidden"`), `&amp;` in URLs.
- `.xhtml` files are served as `application/xhtml+xml`, so the browser uses the XML parser: **any markup error
  stops the page from rendering**. Check a page after editing with:

  ```bash
  xmllint --noout *.xhtml
  ```

- Markup injected from JavaScript (expert cards, filter chips, toasts) is also well-formed XML — keep it that way,
  and escape dynamic values with `FS.esc()`.
- Links written as `href="#"` are prototype placeholders; `core.js` stops them from jumping to the top.
- Shared blocks are repeated in each page, ready to become includes in your templating system (e.g. Facelets
  `ui:include`): the sidebar, welcome banner, chat bubble and activation modal on the account pages; the split
  layout, logo and footer on the sign-up pages. Per page, only the active sidebar item / tab and the section
  content differ.

## JSF integration

### Buttons → `<h:commandLink>`

There is no `<button>` left in the markup. Every action is written the way `<h:commandLink>` renders it,
so the CSS classes carry over unchanged:

| Prototype markup | JSF |
| --- | --- |
| `<a class="btn btn--sky js-submit" href="#" role="button">` | `<h:commandLink styleClass="btn btn--sky js-submit" action="…">` |
| `<a class="btn-sm btn-sm--sky" href="#" role="button" data-activate="…">` | `<h:commandLink styleClass="btn-sm btn-sm--sky" pt:data-activate="true">` (client-side only) |
| `<span class="btn-sm …" aria-disabled="true">` | `<h:commandLink styleClass="btn-sm …" disabled="true">` (JSF renders a `<span>`) |

Client-side-only actions (show password, modal, tooltip, checkboxes, filter chips…) can stay plain `<a href="#">`
or be `<h:commandLink>` with `onclick="return false;"`; the scripts find them by class, not by tag or id.
`core.js` makes every `a[role="button"]` react to the Space key, as a `<button>` would.

### Submitting a form

`<h:commandLink>` submits through its own `onclick`, so there is no `type="submit"` and no `submit` event.
`js/forms.js` registers **one capture-phase click listener** for `.js-submit` links: it validates the link's
`.js-form` group *before* the JSF `onclick` runs and stops the click when a field is invalid. When everything
is valid the click continues untouched to JSF. Nothing to wire per page.

If you prefer an explicit hook: `<h:commandLink onclick="return FS.forms.check(this);" …>`.

Prototype-only: `data-prototype-next="page.xhtml"` on a `.js-submit` link fakes the server round trip
(loading state + navigation). Remove it in the JSF pages.

### Fields are handled as groups

No JavaScript names a field or looks one up by id (JSF prefixes ids, e.g. `form:nome`). Validation, live
feedback, the Enter key and value collection all work on every field in a group, found by class and data
attributes, in the same spirit as `$(".input").each(function () { setPlaceholderInput(this); });`.
Adding a field means adding markup only:

```xml
<h:form styleClass="js-form">
  <div class="field" data-field="nome" data-validate="name" data-label="nome">
    <h:outputLabel styleClass="label" for="nome" value="Nome" />
    <div class="control">
      <h:inputText id="nome" styleClass="input" value="#{registrazione.nome}" />
    </div>
    <div class="error"><span><i class="ph ph-warning-circle"></i><em></em></span></div>
  </div>
  …
  <h:commandLink styleClass="btn btn--sky js-submit" action="#{registrazione.avanti}">
    <span class="btn__label">Registrati</span>
  </h:commandLink>
</h:form>
```

| Attribute / class | Meaning |
| --- | --- |
| `.js-form` | A group of fields submitted together |
| `.field[data-field]` | Key of the value in `FS.forms.values()` |
| `data-validate` | Rule in `FS.forms.rules`: `name`, `email`, `password`, `confirm` (add your own there) |
| `data-label` | Word used in the `name` messages ("Inserisci il tuo *nome*") |
| `data-match` | For `confirm`: the `data-field` it must equal |
| `.input` | The input inside the field |
| `.error em` | Where the message is written (optional) |
| `.rule` | Live requirement indicator, e.g. "almeno 8 caratteri" (optional) |
| `.reveal` | Wraps the action so it slides in once every field is filled (optional) |
| `.js-submit` | The action link |

API (`window.FS.forms`): `values(el)` → `{ nome: '…', cognome: '…', email: '…' }` · `validate(el)` → `true/false`
· `check(link)` for `onclick` chaining · `rules` to add or change rules. A valid group also triggers the jQuery
event `fs:valid` with the values.

## Run it locally

Any static server works, e.g.

```bash
python3 -m http.server 8000
```

then open http://localhost:8000.

## Structure

```
*.xhtml                    One page per screen (see table above)
index.html                 Redirect to signup.xhtml (GitHub Pages entry point)
css/
  base.css                 Design tokens (Figma colour names: Night, Pidgeon, Cloud, Sky, Pearl, Ivory,
                           Suede, Sand, Sempione, Tram, Metro, Ruby…) and base reset
  signup.css               Sign-up journey: split layout, fields, validation states, toasts
  app.css                  Account area: sidebar, welcome banner, sections, activation modal
  prototype.css            The "Prototipo di design" disclosure label
  animations.css           Keyframes + prefers-reduced-motion handling
js/
  core.js                  Shared helpers (wait, esc, go), session state, Space key for action links.
                           Exposed as window.FS; loaded in <head> after jQuery on every page.
  forms.js                 Field groups: rules, live validation, Enter key, capture-phase submit for
                           <h:commandLink>, FS.forms API. Loaded on pages with a form.
  signup.js                Sign-up pages: toasts, show/hide password, arrival message
  app.js                   Account pages: user name, Posta unread dot, fund search, checkboxes,
                           experts keyword filter, activation modal
  data/experts.js          Mock data for the Esperti page (keywords + 9 experts); loaded on esperti.xhtml only
assets/
  images/                  Photos and logos exported from Figma
  images/experts/          Expert avatars (the other six experts use initials)
  illustrations/           Empty-state illustrations (Dossier, Approfondimenti)
vendor/
  jquery/                  jQuery 3.7.1 (official minified build, MIT licence)
  phosphor-icons/          Phosphor Icons 2.1.1 web font (regular, bold, duotone) — unmodified, MIT licence
```

Load order: `vendor/jquery/jquery-3.7.1.min.js` → `js/core.js` (both in `<head>`), then at the end of `<body>`
`js/forms.js` + `js/signup.js` on sign-up pages, or `js/data/experts.js` (Esperti only) + `js/app.js` on account pages.
Handlers are delegated and class-based, so each script only acts on the markup present on the current page.

## State between pages

Stored in `sessionStorage` (keys prefixed `fundstore.prototype.`), cleared when the tab is closed:

- the name, surname and email entered at sign-up (the account area falls back to "Edoardo Bizzarri");
- whether Posta has been opened (the red unread dot in the sidebar disappears after the first visit);
- whether the account area / sign-up has been seen, so one-time entrance animations don't replay on every page.

## External resources

| What | Where | Notes |
| --- | --- | --- |
| Onest, Merriweather | Google Fonts (`<link>` in each page) | Only network dependency |
| jQuery 3.7.1 | `vendor/jquery/` | Same version as production |
| Phosphor Icons 2.1.1 | `vendor/phosphor-icons/` | Classes `ph`, `ph-bold`, `ph-duotone` |

## Deliberately inactive in this prototype

- Sign-up: "Continua con Google", Termini/Condizioni, Privacy Policy, Accedi (show an info message)
- Fondi: search accepts input but returns no results; category chips and "Consulta la Top List"
- Ordini: product-type chips
- Esperti: "Trova il tuo esperto" and "Incontra …" (the keyword filter works)
- Posta → Messaggi: the message cannot be opened (checkboxes work)
- Profilo: all rows and Logout
- The chat bubble
- Activation modal: "Completa in 10 minuti" (the modal closes with × or Esc)
