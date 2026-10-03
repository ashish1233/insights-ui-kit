import type { ReactNode } from 'react';
import { Text } from '../atoms/Text';
import type { TextSize } from '../atoms/Text';
import { cx } from '../utils/cx';
import styles from './SectionHeader.module.css';

/**
 * How loud the heading is. Separate from the element, on purpose — a page can
 * need an `h3` that leads its column and an `h2` that quietly labels a group,
 * and conflating the two is how headings end up chosen for their size and the
 * document outline ends up nonsense.
 */
export type SectionHeaderSize = 'lg' | 'md' | 'sm';

const TITLE_SIZE: Record<SectionHeaderSize, TextSize> = {
  lg: 'xl',
  md: 'lg',
  sm: 'xs',
};

export interface SectionHeaderProps {
  /** The heading element. Chosen by the caller, which is the only code that
   *  knows the page outline. */
  as?: 'h2' | 'h3' | 'h4';
  title: ReactNode;
  /** One line under the title. */
  description?: ReactNode;
  /** Quiet text on the title's baseline — a count, a tenant id. */
  meta?: ReactNode;
  /** Controls at the end of the row: a search field, a filter. */
  actions?: ReactNode;
  size?: SectionHeaderSize;
  /** Needed when the section uses `aria-labelledby`. */
  id?: string;
  className?: string;
}

/**
 * The heading of a section, with its optional count and its optional controls
 * on one baseline.
 *
 * Three sizes and no more. The hub's landing page needs exactly three levels of
 * emphasis — the page's primary column, a group inside it, a panel in the side
 * column — and a kit that offers six invites a page to use five.
 */
export function SectionHeader({
  as = 'h2',
  title,
  description,
  meta,
  actions,
  size = 'lg',
  id,
  className,
}: SectionHeaderProps) {
  const small = size === 'sm';

  return (
    <header
      className={cx(styles.header, small && styles.compact, className)}
    >
      <div className={styles.text}>
        <div className={styles.titleRow}>
          <Text
            as={as}
            id={id}
            size={TITLE_SIZE[size]}
            weight="semibold"
            className={small ? styles.eyebrow : undefined}
          >
            {title}
          </Text>
          {meta ? (
            <Text as="span" size="sm" tone="muted">
              {meta}
            </Text>
          ) : null}
        </div>

        {description ? (
          <Text size="sm" tone="muted" className={styles.description}>
            {description}
          </Text>
        ) : null}
      </div>

      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
