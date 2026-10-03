import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';
import styles from './SplitColumns.module.css';

export interface SplitColumnsProps extends HTMLAttributes<HTMLDivElement> {
  /** The secondary column. Rendered as an `aside` after the main content. */
  aside: ReactNode;
  /** Accessible name for the secondary column — it is a landmark. */
  asideLabel: string;
  /** Width of the secondary column once there is room for one. */
  asideWidth?: string;
  /** Keep the secondary column in view while the main one scrolls. */
  stickyAside?: boolean;
  /** The primary column. */
  children: ReactNode;
}

/**
 * A wide primary column with a narrower secondary one beside it.
 *
 * The source order is main-then-aside, so a screen reader and a keyboard reach
 * the thing the page is *for* before the thing beside it. The two only sit side
 * by side when the viewport can afford it; below the kit's single layout
 * breakpoint the aside stacks underneath.
 *
 * It is a kit primitive rather than a page-local grid because the alternative —
 * every app inventing its own breakpoint — is how a platform ends up with four
 * different points at which its pages reflow.
 */
export function SplitColumns({
  aside,
  asideLabel,
  asideWidth,
  stickyAside = false,
  className,
  style,
  children,
  ...rest
}: SplitColumnsProps) {
  return (
    <div
      {...rest}
      className={cx(styles.split, className)}
      style={
        asideWidth
          ? { ...style, ['--ins-split-aside-width' as string]: asideWidth }
          : style
      }
    >
      <div className={styles.main}>{children}</div>
      <aside
        className={cx(styles.aside, stickyAside && styles.asideSticky)}
        aria-label={asideLabel}
      >
        {aside}
      </aside>
    </div>
  );
}
