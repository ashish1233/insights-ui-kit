import type { ReactNode } from 'react';
import { cx } from '../utils/cx';
import styles from './Alert.module.css';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  /** Usually a Button — e.g. "Sign in again" or "Retry". */
  action?: ReactNode;
  className?: string;
}

/**
 * An inline message.
 *
 * Warnings and errors are announced assertively because they usually interrupt
 * what the user was doing; informational messages are announced politely.
 */
export function Alert({
  tone = 'info',
  title,
  children,
  action,
  className,
}: AlertProps) {
  const assertive = tone === 'danger' || tone === 'warning';

  return (
    <div
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      className={cx(styles.alert, styles[tone], className)}
    >
      <div className={styles.body}>
        {title ? <span className={styles.title}>{title}</span> : null}
        {children ? <div className={styles.content}>{children}</div> : null}
      </div>
      {action ? <div className={styles.actions}>{action}</div> : null}
    </div>
  );
}
