/**
 * Design tokens.
 *
 * These plain objects are the single source of truth. Everything else in the kit
 * — including every CSS module — reads them through the CSS custom properties
 * derived in `cssVariables.ts`. Nothing hard-codes a colour or a spacing value,
 * which is what lets the whole platform be re-themed from this one file.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * HOW COLOUR IS RATIONED
 *
 * There are exactly two jobs colour does here, and keeping them apart is the
 * single most important rule in this file.
 *
 *   1. **Brand and action** — one vivid magenta-violet, and nothing else. It
 *      marks the primary button, links, the active nav item, and the focus
 *      ring. One accent used with conviction reads as a decision; three accents
 *      read as a theme nobody finished.
 *
 *   2. **Information** — green for healthy, red for a genuine fault, ochre for
 *      the restricted tier, amber for something with a deadline on it. These
 *      are the only places on a page where a colour is a *fact*, and they must
 *      never be confusable with the accent. If the restricted badge drifted
 *      towards magenta it would stop being readable as a tier and start being
 *      readable as a button — and that badge is load-bearing for ADR-2, which
 *      is the decision this whole platform is organised around.
 *
 * So: magenta is never a status, and no status is ever magenta. The restricted
 * ochre is kept deliberately browner than the amber warning so the two are
 * separable side by side, which they have to be — an app can be restricted
 * *and* have a deadline against it at the same time.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * CONTRAST
 *
 * Every value below that is used for text has been checked against the surface
 * it sits on. Measured against white: primary 6.3:1, muted text 7.7:1, body ink
 * 17.7:1, success 5.0:1, warning 5.0:1, danger 6.5:1, restricted 6.9:1 — all
 * past AA for body text, not merely for large text. White on the primary fill
 * is 6.3:1, so the solid magenta button is legible rather than nearly so.
 */

export const color = {
  /* Neutrals -------------------------------------------------------------- */

  /*
   * White and two light neutrals, and the page is built out of the rhythm
   * between them: a tinted page, white cards, a sunken panel holding a group of
   * them. That alternation is what gives a long page its structure — borders
   * drawn around everything do the same job far more loudly and much worse.
   */
  surface: '#ffffff',
  surfaceMuted: '#fafafa',
  surfaceSunken: '#f4f4f5',
  border: '#e4e4e7',
  borderStrong: '#d4d4d8',

  /* Near-black, not mid-grey. Strong contrast is most of what makes a page
   * look deliberate rather than unfinished. */
  text: '#18181b',
  textMuted: '#52525b',
  textInverse: '#ffffff',

  /* Primary action — the one accent ---------------------------------------- */

  /*
   * A single magenta-violet carries brand, primary actions, links and the
   * active nav state. This value is dark enough to pass AA as body text on
   * white *and* light enough to take white text on top of it, which is why it
   * can be both the link colour and the button fill — no second "text version"
   * of the brand colour, and therefore no chance of the two drifting apart.
   */
  primary: '#a21caf',
  primaryHover: '#86198f',
  primaryActive: '#701a75',
  primarySurface: '#fdf4ff',
  primaryBorder: '#f5d0fe',

  /* Status ---------------------------------------------------------------- */

  /* Blue, not magenta. "Here is some context" must not look like "do this". */
  info: '#1d4ed8',
  infoSurface: '#eff6ff',
  infoBorder: '#bfdbfe',

  success: '#15803d',
  successSurface: '#f0fdf4',
  successBorder: '#bbf7d0',

  /* Orange-amber. Reserved for a thing with a date on it. */
  warning: '#b45309',
  warningSurface: '#fff7ed',
  warningBorder: '#fed7aa',

  danger: '#b91c1c',
  dangerHover: '#991b1b',
  dangerSurface: '#fef2f2',
  dangerBorder: '#fecaca',

  /**
   * Restricted tier (ADR-2).
   *
   * A deep warm ochre, chosen on purpose and kept browner than the warning
   * amber above it. It has to read as "handle with care" without reading as
   * "something is broken": restricted tier is a normal, healthy operating state
   * for a tenant like People Analytics, not an error, so it must share neither
   * the danger red nor the brand magenta.
   */
  restricted: '#854d0e',
  restrictedSurface: '#fefce8',
  restrictedBorder: '#fde68a',

  /* Focus ----------------------------------------------------------------- */
  focusRing: '#a21caf',
} as const;

/*
 * The top of the scale is deliberately generous. Whitespace is the cheapest
 * thing a dense page has, and the difference between "dense" and "cramped" is
 * almost entirely how much room the groups get between them rather than how
 * much the rows get inside them.
 */
export const spacing = {
  none: '0',
  xxs: '2px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '36px',
  xxxl: '56px',
} as const;

export const typography = {
  /*
   * A clean geometric sans, resolved locally. Inter and SF are listed first for
   * the machines that have them and everything falls back to the platform UI
   * face — no webfont, no network request, no flash of unstyled text. The kit
   * dropped its bundled webfont for exactly this reason; see the release note.
   */
  fontFamilySans:
    "Inter, 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI Variable Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontFamilyMono:
    "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",

  /*
   * A wider range than before, top and bottom. The old scale ran 11–24px, which
   * is five sizes inside half an octave — everything ended up looking like the
   * same size in a slightly different weight, and a page with no size contrast
   * has no hierarchy however carefully it is ordered.
   */
  fontSizeXs: '12px',
  fontSizeSm: '13px',
  fontSizeMd: '15px',
  fontSizeLg: '17px',
  fontSizeXl: '22px',
  fontSizeXxl: '30px',

  fontWeightRegular: '400',
  fontWeightMedium: '500',
  fontWeightSemibold: '600',

  lineHeightTight: '1.3',
  lineHeightNormal: '1.6',
} as const;

export const radius = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '12px',
  pill: '999px',
} as const;

/*
 * Two-layer shadows: a tight contact shadow plus a wider soft one. A single
 * blurred shadow reads as a drop shadow from a decade ago; the pair reads as an
 * object resting on a surface. Kept very low-opacity — a card in a grid of
 * twenty should be *separable*, not floating.
 */
export const elevation = {
  none: 'none',
  sm: '0 1px 2px rgba(24, 24, 27, 0.04), 0 1px 3px rgba(24, 24, 27, 0.06)',
  md: '0 2px 4px rgba(24, 24, 27, 0.04), 0 6px 16px rgba(24, 24, 27, 0.08)',
  lg: '0 8px 32px rgba(24, 24, 27, 0.12)',
} as const;

export const tokens = { color, spacing, typography, radius, elevation } as const;

export type ColorToken = keyof typeof color;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
export type ElevationToken = keyof typeof elevation;
export type Tokens = typeof tokens;
