import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';
import styles from './CardGrid.module.css';

export interface CardGridProps extends HTMLAttributes<HTMLElement> {
  /**
   * The narrowest a column may become before the grid drops one. The default
   * suits a card with a name, a line of description and a metadata row — about
   * three columns in a full-width content area, one on a phone.
   */
  minColumnWidth?: string;
  gap?: 'md' | 'lg' | 'xl';
  /**
   * `ul` when the grid is a list of things — a directory, a set of results.
   * The caller supplies `li` children; the bullets and padding are removed
   * here so no app has to remember to.
   */
  as?: 'div' | 'ul';
  children?: ReactNode;
}

/**
 * A responsive grid of cards.
 *
 * It is in the kit because "lay these out in however many columns fit" is the
 * single most-copied snippet in a multi-app platform, and every copy picks a
 * slightly different minimum width and a slightly different gap. One primitive
 * means a directory in the hub and a results grid in a tenant app break to one
 * column at the same point, which is what makes the platform feel like one
 * product rather than twenty-five.
 *
 * It has no opinion about what a card is — only about the tracks. Pass
 * {@link LinkCard}, {@link Card}, or anything else.
 */
export function CardGrid({
  minColumnWidth = '280px',
  gap = 'lg',
  as: Component = 'div',
  className,
  style,
  children,
  ...rest
}: CardGridProps) {
  const gapClass =
    gap === 'md' ? styles.gapMd : gap === 'xl' ? styles.gapXl : styles.gapLg;

  return (
    <Component
      {...rest}
      className={cx(styles.grid, gapClass, className)}
      style={{ ...style, ['--ins-card-grid-min' as string]: minColumnWidth }}
    >
      {children}
    </Component>
  );
}
