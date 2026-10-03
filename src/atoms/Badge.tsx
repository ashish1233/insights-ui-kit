import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';
import styles from './Badge.module.css';

export type BadgeTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  /** Reserved for the restricted tenant tier (ADR-2). */
  | 'restricted';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: ReactNode;
}

export function Badge({
  tone = 'neutral',
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span {...rest} className={cx(styles.badge, styles[tone], className)}>
      {children}
    </span>
  );
}
