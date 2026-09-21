# Fundstore Onboarding — design prototype

Clickable desktop prototype of the Fundstore sign-up and first-login journey, built from the Figma designs
(file `Fundstore`, frames `signup 1–4`, `landing`, `funds`, `movements`, `orders`, `advisors`, `mail`, `news`,
`settings`, `activation modal`).

**Live:** https://guaskeyno.github.io/fundstore-onboarding/

No build step, no framework, no dependencies to install: plain HTML, CSS and JavaScript.
Nothing typed into the prototype is sent anywhere.

## Run it locally

Any static server works, e.g.

```bash
python3 -m http.server 8000
```

then open http://localhost:8000. (Opening `index.html` directly from disk also works.)

## Structure

```
index.html                 Markup for every screen: sign-up steps, account area, activation modal
css/
  base.css                 Design tokens (Figma colour names: Night, Pidgeon, Cloud, Sky, Pearl, Ivory,
                           Suede, Sand, Sempione, Tram, Metro, Ruby…) and base reset
  signup.css               Sign-up journey: split layout, fields, validation states, toasts
  app.css                  Account area: sidebar, welcome banner, the six sections, activation modal
  prototype.css            The "Prototipo di design" disclosure label
  animations.css           Keyframes + prefers-reduced-motion handling
js/
  core.js                  Shared helpers ($, $$, wait, esc) and state, exposed as window.FS — load first
  data/experts.js          Mock data for the Esperti section (keywords + 9 experts)
  signup.js                Sign-up flow: step navigation, validation, password rules, toasts
  app.js                   Account area: hash routing, tabs, fund search, mail checkboxes,
                           experts keyword filter, activation modal
assets/
  images/                  Photos and logos exported from Figma
  images/experts/          Expert avatars (the other six experts use initials)
  illustrations/           Empty-state illustrations (Dossier, Approfondimenti)
vendor/
  phosphor-icons/          Phosphor Icons 2.1.1 web font (regular, bold, duotone) — unmodified, MIT licence
```

Scripts are classic (non-module) scripts loaded in order at the end of `<body>`:
`core.js → data/experts.js → signup.js → app.js`.

## External resources

| What | Where | Notes |
| --- | --- | --- |
| Onest, Merriweather | Google Fonts (`<link>` in `index.html`) | Only network dependency |
| Phosphor Icons 2.1.1 | `vendor/phosphor-icons/` | Classes `ph`, `ph-bold`, `ph-duotone` |

## Routing

The account area uses hash routes, so any section can be linked directly:
`#app/dossier`, `#app/fondi`, `#app/movimenti`, `#app/esperti`, `#app/posta`, `#app/profilo`.
The plain URL starts at the sign-up.

## Deliberately inactive in this prototype

- Fondi: search accepts input but returns no results; category chips and "Consulta la Top List"
- Movimenti e Ordini → Ordini: product-type chips
- Esperti: "Trova il tuo esperto" and "Incontra …" (the keyword filter works)
- Posta → Messaggi: the message cannot be opened (checkboxes work)
- Profilo: all rows and Logout
- The chat bubble
- Activation modal: "Completa in 10 minuti" (the modal opens from "Completa la registrazione",
  "Inizia a Investire" and "Attiva il wallet", and closes with × or Esc)
