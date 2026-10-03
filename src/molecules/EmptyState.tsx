import type { ReactNode } from 'react';
import { Text } from '../atoms/Text';
import { cx } from '../utils/cx';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  /** Usually a Button. Keep it to one. */
  action?: ReactNode;
  className?: string;
}

/** The "nothing here" placeholder — used for empty results, not for errors. */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cx(styles.empty, className)}>
      <Text size="md" weight="semibold">
        {title}
      </Text>
      {description ? (
        <Text size="sm" tone="muted" className={styles.description}>
          {description}
        </Text>
      ) : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
