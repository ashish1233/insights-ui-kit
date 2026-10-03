/**
 * Derives CSS custom properties from the token objects, so the TypeScript
 * objects stay the single source of truth and the stylesheet cannot drift from
 * them.
 *
 * Naming: `--ins-<group>-<token>`, e.g. `--ins-color-primary`,
 * `--ins-space-lg`, `--ins-font-size-md`, `--ins-radius-md`.
 */
import { color, elevation, radius, spacing, typography } from './tokens';

const kebab = (value: string): string =>
  value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const group = (
  prefix: string,
  values: Readonly<Record<string, string>>,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      `--ins-${prefix}${prefix ? '-' : ''}${kebab(key)}`,
      value,
    ]),
  );

/** Every token as a `{ '--ins-...': value }` map. */
export const cssVariables: Record<string, string> = {
  ...group('color', color),
  ...group('space', spacing),
  ...group('radius', radius),
  ...group('elevation', elevation),
  ...group('', typography),
};

/** The same map rendered as a `:root { ... }` rule. */
export const tokensCssText: string = `:root {\n${Object.entries(cssVariables)
  .map(([name, value]) => `  ${name}: ${value};`)
  .join('\n')}\n}\n`;

const STYLE_ELEMENT_ID = 'insights-ui-kit-tokens';

/**
 * Installs the token custom properties into `document.head`, once.
 *
 * The kit's barrel calls this on import, so an app only has to import the
 * compiled component stylesheet. Server-rendered apps that want the variables
 * in the initial HTML should inline {@link tokensCssText} instead; calling this
 * afterwards is a no-op.
 */
export function installTokens(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = tokensCssText;
  // Prepend so application stylesheets can still override a variable.
  document.head.prepend(style);
}
