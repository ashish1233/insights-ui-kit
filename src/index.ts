/**
 * @insights-platform/ui-kit
 *
 * The shared design system for Insights Hub apps. See README.md.
 */
import { installTokens } from './tokens/cssVariables';

// Side effect on import: puts the token custom properties into the document so
// an app only has to import the compiled stylesheet. No-op outside the browser.
installTokens();

export * from './tokens';
export * from './atoms';
export * from './molecules';
export * from './layouts';
export * from './organisms';
export * from './hooks';
export * from './types';

export { cx } from './utils/cx';
export {
  ApiError,
  DEFAULT_API_BASE_URL,
  DEFAULT_IDENTITY_BASE_URL,
} from './utils/http';
