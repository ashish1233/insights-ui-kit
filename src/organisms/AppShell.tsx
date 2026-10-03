import type { ReactNode } from 'react';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Text } from '../atoms/Text';
import type { TenantTier } from '../types';
import { cx } from '../utils/cx';
import styles from './AppShell.module.css';

export interface AppShellProps {
  appName: string;
  /** From `GET /health`. Omit while the health check is still in flight. */
  tenantId?: string;
  /** From `GET /health`. Assigned by the platform, never by the app (ADR-2). */
  tier?: TenantTier;
  /** The signed-in user, shown next to the sign-out control. */
  subject?: string;
  onSignOut?: () => void;
  /** Extra header content, e.g. a refresh button. */
  headerActions?: ReactNode;
  /**
   * Width of the content column. Any CSS length.
   *
   * The default suits the single-column reporting app every tenant builds, and
   * is the right default precisely because nobody should have to think about
   * it. A page with a directory and a side column — the hub is the only one on
   * the platform — needs more, and should say so here rather than reaching into
   * this component's class names from outside.
   */
  maxWidth?: string;
  children?: ReactNode;
  className?: string;
}

const MAIN_ID = 'ins-main-content';

/**
 * Page frame: a header identifying the app, its tenant and its isolation tier,
 * and a sign-out control.
 *
 * The tier is displayed on every page on purpose. A restricted-tier app behaves
 * differently from a standard one — fail-closed audit means it can refuse a
 * request that a standard app would serve — and someone looking at a screenshot
 * during an incident should be able to tell which they are looking at.
 */
export function AppShell({
  appName,
  tenantId,
  tier,
  subject,
  onSignOut,
  headerActions,
  maxWidth,
  children,
  className,
}: AppShellProps) {
  const restricted = tier === 'restricted';

  return (
    <div className={cx(styles.shell, className)}>
      <a className={styles.skipLink} href={`#${MAIN_ID}`}>
        Skip to main content
      </a>

      {restricted ? (
        <div className={styles.restrictedBand} aria-hidden="true" />
      ) : null}

      <header className={styles.header}>
        <div className={styles.identity}>
          {/*
            The platform mark. Decorative, hence `aria-hidden` — the `h1` beside
            it already names the app, and a screen reader announcing "logo" adds
            nothing.

            It is here rather than in the hub because every app on the platform
            wears the same chrome, and this is the one place the brand colour
            appears on a page that has no primary action on it. Keeping brand to
            a 20px mark is also what stops it competing with the tier badge a
            few pixels to its right, which is the one thing in this header that
            carries information.
          */}
          <span className={styles.mark} aria-hidden="true" />

          <Text as="h1" size="xl" weight="semibold" className={styles.appName}>
            {appName}
          </Text>

          {tenantId || tier ? (
            <>
              <span className={styles.divider} aria-hidden="true" />
              <div className={styles.meta}>
                {tenantId ? (
                  <Text size="sm" tone="muted" mono>
                    {tenantId}
                  </Text>
                ) : null}
                {tier ? (
                  <Badge tone={restricted ? 'restricted' : 'neutral'}>
                    {restricted ? 'Restricted tier' : 'Standard tier'}
                  </Badge>
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        <div className={styles.account}>
          {headerActions}
          {subject ? (
            <Text size="sm" tone="muted">
              Signed in as <strong>{subject}</strong>
            </Text>
          ) : null}
          {onSignOut ? (
            <Button size="sm" variant="secondary" onClick={onSignOut}>
              Sign out
            </Button>
          ) : null}
        </div>
      </header>

      <main
        id={MAIN_ID}
        className={styles.main}
        style={maxWidth ? { maxWidth } : undefined}
      >
        {children}
      </main>
    </div>
  );
}
