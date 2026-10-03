# `@insights-platform/ui-kit`

The shared design system for Insights Hub applications: tokens, a small set of
components, and the three hooks that talk to the platform's HTTP contract.

It ships from the platform repository alongside the Python SDK, for the reason
given in ADR-1 (ADR-1, in the `insights-platform` repository):
at two to three engineers the expensive thing is not release coupling, it is the
compatibility matrix between separately-versioned packages.

## Why it is this small

Everything in this package is a permanent maintenance commitment for the
platform team. The component list below is therefore the set an insight app
genuinely cannot be built without — not a catalogue.

Things deliberately absent: modals, tabs, tooltips, date pickers, toasts, charts,
a theming API, table sorting/paging/virtualisation, and any dependency on a
third-party component library. Each is a real cost (focus management, portals,
scroll locking, a config surface) that no app on the platform needs yet. A team
that needs one builds it locally first; it moves in here when a second team needs
the same thing.

## Install

```sh
npm install @insights-platform/ui-kit
```

React 18 is a peer dependency — the app supplies it.

```tsx
// main.tsx
import '@insights-platform/ui-kit/styles.css';
```

Importing the package installs the design tokens as CSS custom properties on
`document.head`. Server-rendered apps can inline `tokensCssText` instead to avoid
a flash; calling it twice is a no-op.

## A whole app

This is the entire shape of a tenant frontend. Both scaffolds are variations on
it.

```tsx
import {
  Alert,
  AppShell,
  Button,
  Card,
  DataTable,
  EmptyState,
  LoginPanel,
  useAuth,
  useHealth,
  useInsights,
} from '@insights-platform/ui-kit';
import type { DataTableColumn, InsightRow } from '@insights-platform/ui-kit';

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const IDENTITY_URL =
  import.meta.env.VITE_IDENTITY_BASE_URL ?? 'http://localhost:8081';

const columns: DataTableColumn<InsightRow>[] = [
  { key: 'metric', header: 'Metric' },
  { key: 'period', header: 'Period', width: '140px' },
  { key: 'value', header: 'Value', align: 'right' },
];

export function App() {
  const auth = useAuth({ identityUrl: IDENTITY_URL, scopes: ['insights:read'] });
  const { health } = useHealth({ apiUrl: API_URL });
  const insights = useInsights({
    token: auth.token,
    apiUrl: API_URL,
    onUnauthorized: () => auth.logout({ expired: true }),
  });

  if (!auth.isAuthenticated) {
    return (
      <LoginPanel
        appName="Spend Insights"
        onSubmit={auth.login}
        busy={auth.status === 'signing-in'}
        errorTitle={auth.expired ? 'Session expired' : 'Could not sign in'}
        error={
          auth.expired
            ? 'Your session timed out. Sign in again to continue.'
            : auth.error
        }
      />
    );
  }

  return (
    <AppShell
      appName="Spend Insights"
      tenantId={health?.tenant_id}
      tier={health?.tier}
      subject={auth.session?.subject}
      onSignOut={() => auth.logout()}
    >
      {insights.status === 'error' ? (
        <Alert
          tone="danger"
          title="Could not load insights"
          action={<Button size="sm" onClick={insights.refresh}>Retry</Button>}
        >
          {insights.error}
        </Alert>
      ) : null}

      <Card title="Insights" padding="none">
        <DataTable
          caption="Insight rows for this tenant"
          columns={columns}
          rows={insights.rows}
          getRowKey={(row) => row.id}
          loading={insights.status === 'loading'}
          empty={<EmptyState title="No rows yet" />}
        />
      </Card>
    </AppShell>
  );
}
```

## Tokens

`src/tokens/tokens.ts` holds plain objects — `color`, `spacing`, `typography`,
`radius`, `elevation`. They are the single source of truth; the CSS custom
properties every component reads are *derived* from them, so a stylesheet cannot
drift from the TypeScript values.

| Export | What it is |
| --- | --- |
| `color`, `spacing`, `typography`, `radius`, `elevation` | the token objects |
| `tokens` | all five, grouped |
| `cssVariables` | `{ '--ins-color-primary': '#a21caf', … }` |
| `tokensCssText` | the same as a `:root { … }` rule |
| `installTokens()` | injects that rule once; called on import |

Naming is `--ins-<group>-<token>`: `--ins-color-primary`, `--ins-space-lg`,
`--ins-radius-md`, `--ins-font-size-md`, `--ins-elevation-sm`.

The palette is low-chroma on purpose. One colour is worth calling out:

```ts
color.restricted; // '#7a5c2e' — a muted ochre
```

`restricted` marks an app on the **restricted tenant tier** (ADR-2). It is not
`danger`, and that distinction is the point: restricted tier is a normal, healthy
operating state for a tenant like People Analytics, so it must not look like a
fault. It is still distinct enough that nobody mistakes a restricted app for a
standard one in a screenshot during an incident.

## Components

### Atoms

| Component | Notes |
| --- | --- |
| `Button` | `variant` primary / secondary / ghost / danger, `size` sm / md, `busy`, `fullWidth`. Forwards refs. |
| `Input` | Native `<input>` plus an `invalid` flag. Forwards refs. |
| `Select` | Native `<select>` from an `options` array, optional `placeholder`. Forwards refs. |
| `Badge` | `tone` neutral / info / success / warning / danger / **restricted**. |
| `Text` | `as` picks the element (heading level is a semantic decision, never inferred from size), plus `size`, `weight`, `tone`, `mono`. |
| `Card` | Flat, borderless surface with an optional header. `padding="none"` for a full-bleed `DataTable`. |
| `MetaRow` | The quiet dot-separated line of facts under a title — tenant, tier, status. Drops falsy entries so a caller can write `[tenant, isJob && 'job']` without leaving a stray separator behind, and keeps each separator glued to the item it precedes so a wrapped row never starts a line with a lone `·`. |

### Molecules

| Component | Notes |
| --- | --- |
| `FormField` | Wires a real `<label>` to its control: injects `id`, `aria-describedby`, `required` and `invalid` into its single child, so a caller cannot forget them. |
| `DataTable` | `columns` + `rows` + `getRowKey` + a visually-hidden `caption`. Has loading and empty states. No sorting — see above. |
| `Alert` | `tone` info / success / warning / danger. Warnings and errors announce assertively; info announces politely. |
| `EmptyState` | Title, optional description, optional single action. |
| `LinkCard` | A card whose whole surface is one anchor — not a card with a "View" link in the corner. One tab stop and a 280×150px target instead of a 40px one, and because it is a real `<a href>`, ⌘-click, middle-click and "copy link address" keep working. Omit `href` and it renders as an inert `article`, which is the honest rendering of "there is nothing to open". `accent="restricted"` draws the ADR-2 tier rule. **Constraint: no interactive element may be nested inside** — an anchor inside an anchor is invalid and browsers resolve it by dropping one. |
| `SectionHeader` | Heading, optional count and optional controls on one baseline. Three sizes, and `as` is separate from `size` so a page can have an `h3` that leads a column and an `h2` that quietly labels a group — conflating them is how headings get picked for their size and the document outline ends up nonsense. |
| `Carousel` | One item at a time, advanced **only by the reader**. No auto-rotation, and it should not grow one: a timer moves content away mid-sentence and engagement past the first slide is negligible. Carries the accessibility contract — `aria-roledescription` pair, polite live region, hidden slides kept out of the tab order, reduced-motion guard — which is the reason it is in the kit rather than in one app. |
| `StatTile` | One labelled figure, with an optional `adornment` (usually a `Badge` carrying status) and a one-line `hint`. Has no surface of its own, so a strip of them can sit on a `Card`, in a header, or inline — the caller owns that decision. Tabular figures, so a row of counts does not jitter as it updates. |

### Layouts

| Component | Notes |
| --- | --- |
| `CardGrid` | Responsive grid of equal-width tracks — `minColumnWidth`, `gap`, and `as="ul"` for list semantics without the bullets. Uses `auto-fill` rather than `auto-fit` on purpose: `auto-fit` stretches a group of two cards to twice the width of a group of five below it, which reads as the two being more important when the data said no such thing. |
| `SplitColumns` | A wide primary column with a narrower `aside` beside it, stacking below the kit's single layout breakpoint (1080px). Source order is main-then-aside, so a keyboard and a screen reader reach the thing the page is *for* first. One breakpoint for the whole platform, so every page reflows at the same width. |

### Organisms

| Component | Notes |
| --- | --- |
| `LoginPanel` | Tenant + user + sign in. Hands the values back through `onSubmit`; it does not know how tokens are issued, so it works against the identity stub and a real issuer unchanged. Pass `tenants` for a picker instead of a free-text field, and `errorTitle` to head an expired session correctly — the user did not fail to sign in. |
| `AppShell` | Header with the platform mark, app name, tenant, tier badge and sign-out, plus a `maxWidth` prop for the content column — a page with a directory and a side column says so there rather than reaching into this component's class names from outside. Also carries a skip link and a `<main>` landmark. Restricted-tier apps also get a persistent band across the top of the header — a badge alone is easy to stop seeing. |

## Hooks

### `useAuth({ identityUrl?, storageKey?, scopes? })`

`POST {identityUrl}/token/user` with `{ tenant_id, subject, scopes }`, keeps the
resulting session in `localStorage`, and syncs sign-out across tabs.

Returns `{ session, token, isAuthenticated, status, error, expired, login, logout }`.

`localStorage` is a deliberate and limited choice: it survives a reload, which is
what a reporting tool needs, and it is readable by any script on the origin,
which is why these are short-lived platform tokens rather than long-lived
credentials. An app needing stronger handling should use httpOnly cookies and not
this hook.

`logout({ expired: true })` records that the session was *ended by the server*
rather than by the user, which is what lets the login screen say so.

### `useInsights({ token, apiUrl?, enabled?, onUnauthorized? })`

`GET {apiUrl}/api/insights` with `Authorization: Bearer <token>`.

Returns `{ rows, status, error, refresh }` where `status` is
`idle | loading | ready | error | unauthorized`.

**A 401 is its own status, not an error.** The two need different interfaces: an
error asks the user to retry, an expired session asks them to sign in again.
Collapsing them is how an app ends up showing a blank page to someone whose token
merely timed out.

### `useHealth({ apiUrl?, enabled? })`

`GET {apiUrl}/health` → `{ status, tenant_id, tier, sdk_version }`, for the
tenant and tier the shell displays.

Tier comes from the backend rather than from a frontend constant because ADR-2
makes tier a property of the tenant held in platform configuration. A hard-coded
constant could disagree with reality, and it would be the more visible of the
two.

## Accessibility

Not a later pass; the API shapes are chosen so the accessible thing is the
default thing.

- `FormField` is the only way to label a control, and it injects the wiring
  itself. There is no path through the API that produces a placeholder-as-label.
- One focus treatment for the whole kit, via `:focus-visible` — visible for
  keyboard users, absent for mouse users, never removed.
- Every text/background pair meets WCAG AA (≥ 4.5:1); the restricted ochre on its
  surface is 5.4:1.
- `DataTable` renders a real `<table>` with `scope="col"` headers and a
  visually-hidden caption.
- Status is never carried by colour alone: every `Alert` and every `Badge` states
  its meaning in text.
- `AppShell` provides a skip link and a `<main>` landmark.
- `prefers-reduced-motion` is respected.

## Develop

```sh
npm install
npm run build      # tsc --noEmit, then vite build (ESM + .d.ts + style.css)
npm run typecheck
npm run dev        # rebuild on change, for linked consumers
```

Styling is CSS Modules only — no CSS-in-JS runtime and no component library. The
build emits `dist/index.js`, `dist/index.d.ts` and `dist/style.css`.
