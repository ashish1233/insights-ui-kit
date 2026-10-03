import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';
import styles from './MetaRow.module.css';

export interface MetaRowProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * One entry per field. `null`, `undefined` and `false` are dropped, so a
   * caller can write `[tenant, isJob && 'job']` without assembling the array
   * conditionally and without leaving a stray separator behind.
   */
  items: ReactNode[];
  /** Tabular monospace — for rows that are mostly identifiers and numbers. */
  mono?: boolean;
}

/**
 * The quiet line of facts under a card's title: tenant, tier, status.
 *
 * Its whole job is to be the least prominent text in the card while staying
 * legible — the reader scans names, and comes to this row only once a name has
 * caught them. Being a component rather than a span with separators typed by
 * hand is what keeps the separator from drifting between a dot, a slash and a
 * pipe across twenty-five apps.
 */
export function MetaRow({
  items,
  mono = false,
  className,
  ...rest
}: MetaRowProps) {
  const present = items.filter(
    (item) => item !== null && item !== undefined && item !== false,
  );
  if (present.length === 0) return null;

  return (
    <div {...rest} className={cx(styles.row, mono && styles.mono, className)}>
      {present.map((item, index) => (
        /*
         * The separator lives *inside* the item it precedes, so the two wrap
         * as a unit. Rendered as siblings they come apart the moment the row
         * is too long for its card, and a line starting with a lone "·" looks
         * like a rendering bug rather than a metadata row.
         *
         * Index keys: the array is positional by definition — field three is
         * "tier" whatever its value — and nothing here is reordered or removed
         * after mount.
         */
        // eslint-disable-next-line react/no-array-index-key
        <span className={styles.item} key={index}>
          {index > 0 ? (
            <span className={styles.separator} aria-hidden="true">
              &middot;
            </span>
          ) : null}
          {item}
        </span>
      ))}
    </div>
  );
}
