# Locus

CRA app with a GSAP-driven intro (`src/components/Intro`).

## Tweaking the intro

All durations live in the `CONFIG` object at the top of `src/components/Intro/Intro.jsx`
(seconds, from timeline start): `draw`, `pulse`, `slide`, `letters`, `line`, `exit`, plus
`ease`, `overshoot` and `parallax`. Total length = `exit.at + exit.dur` (~4.5 s).

- Plays once per session (`sessionStorage` key `locus-intro-seen`). Clear it to replay.
- Skip: button, click anywhere, or `Esc`.
- `prefers-reduced-motion`: ~1 s fade-in of logo + wordmark, no particles/parallax.
- To use your own artwork, replace the two `<path>`s in `Intro.jsx` (keep `pathLength="1"` and the `intro__stroke` class).

## Scripts

`npm start` · `npm run build`
