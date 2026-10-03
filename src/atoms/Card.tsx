import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';
import { Text } from './Text';
import styles from './Card.module.css';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /**
   * Renders a header region with a heading. Omit for a plain surface.
   *
   * This shadows the DOM `title` attribute deliberately — a Card's title is
   * visible content, not a tooltip.
   */
  title?: ReactNode;
  description?: ReactNode;
  /** Right-aligned header content, typically a Button or a Badge. */
  actions?: ReactNode;
  /** `none` is for full-bleed children such as a DataTable. */
  padding?: 'none' | 'sm' | 'md';
  /** Heading level for `title`. Pick the one that fits the page outline. */
  headingLevel?: 'h2' | 'h3' | 'h4';
  children?: ReactNode;
}

export function Card({
  title,
  description,
  actions,
  padding = 'md',
  headingLevel = 'h2',
  className,
  children,
  ...rest
}: CardProps) {
  const bodyClass =
    padding === 'none'
      ? styles.bodyNone
      : padding === 'sm'
        ? styles.bodySm
        : styles.bodyMd;

  return (
    <section {...rest} className={cx(styles.card, className)}>
      {title || actions ? (
        <header className={styles.header}>
          <div className={styles.headerText}>
            {title ? (
              <Text as={headingLevel} size="lg" weight="semibold">
                {title}
              </Text>
            ) : null}
            {description ? (
              <Text size="sm" tone="muted">
                {description}
              </Text>
            ) : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </header>
      ) : null}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}
