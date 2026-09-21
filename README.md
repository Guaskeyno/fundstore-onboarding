# Fundstore Onboarding — design prototype

Clickable desktop prototype of the Fundstore sign-up and first-login journey, built from the Figma designs
(file `Fundstore`, frames `signup 1–4`, `landing`, `funds`, `movements`, `orders`, `advisors`, `mail`, `news`,
`settings`, `activation modal`).

**Live:** https://guaskeyno.github.io/fundstore-onboarding/

One XHTML5 file per screen. No build step, no framework, no dependencies to install: plain XHTML, CSS and
JavaScript. Nothing typed into the prototype is sent anywhere.

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
- Shared blocks are repeated in each page, ready to become includes in your templating system (e.g. Facelets
  `ui:include`): the sidebar, welcome banner, chat bubble and activation modal on the account pages; the split
  layout, logo and footer on the sign-up pages. Per page, only the active sidebar item / tab and the section
  content differ.

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
  core.js                  Shared helpers ($, $$, wait, esc, go) and session state, exposed as window.FS.
                           Loaded in <head> on every page.
  signup.js                Sign-up pages: validation, password rules, toasts, moving to the next step
  app.js                   Account pages: user name, Posta unread dot, fund search, mail checkboxes,
                           experts keyword filter, activation modal
  data/experts.js          Mock data for the Esperti page (keywords + 9 experts); loaded on esperti.xhtml only
assets/
  images/                  Photos and logos exported from Figma
  images/experts/          Expert avatars (the other six experts use initials)
  illustrations/           Empty-state illustrations (Dossier, Approfondimenti)
vendor/
  phosphor-icons/          Phosphor Icons 2.1.1 web font (regular, bold, duotone) — unmodified, MIT licence
```

Each script only wires up the elements present on the current page, so the same files are included everywhere.

## State between pages

Stored in `sessionStorage` (keys prefixed `fundstore.prototype.`), cleared when the tab is closed:

- the name, surname and email entered at sign-up (the account area falls back to "Edoardo Bizzarri");
- whether Posta has been opened (the red unread dot in the sidebar disappears after the first visit);
- whether the account area / sign-up has been seen, so one-time entrance animations don't replay on every page.

## External resources

| What | Where | Notes |
| --- | --- | --- |
| Onest, Merriweather | Google Fonts (`<link>` in each page) | Only network dependency |
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
