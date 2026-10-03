import type { ReactNode } from 'react';
import { Text } from '../atoms/Text';
import { cx } from '../utils/cx';
import styles from './StatTile.module.css';

export interface StatTileProps {
  /** Short, stable label — "Tenants", "SDK version". */
  label: ReactNode;
  value: ReactNode;
  /** Optional trailing element, usually a Badge carrying a status. */
  adornment?: ReactNode;
  /** One line under the value. Keep it to a few words. */
  hint?: ReactNode;
  className?: string;
}

/**
 * One labelled figure in a status strip.
 *
 * It is in the kit rather than in the shell because "a number with a label and
 * a status next to it" is the shape every reporting app on this platform ends
 * up drawing, and twenty-five slightly different versions of it is precisely
 * the drift the kit exists to prevent.
 *
 * Deliberately not a card: a tile has no surface of its own, so a caller
 * decides whether a strip of them sits on a Card, in a header, or inline. That
 * keeps it composable and keeps the elevation decisions in one place.
 */
export function StatTile({
  label,
  value,
  adornment,
  hint,
  className,
}: StatTileProps) {
  return (
    <div className={cx(styles.tile, className)}>
      <Text as="span" size="xs" tone="muted" weight="medium" className={styles.label}>
        {label}
      </Text>
      <span className={styles.value}>
        <Text as="span" size="lg" weight="semibold" className={styles.valueText}>
          {value}
        </Text>
        {adornment}
      </span>
      {hint ? (
        <Text as="span" size="xs" tone="muted">
          {hint}
        </Text>
      ) : null}
    </div>
  );
}
