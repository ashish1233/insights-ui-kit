import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';
import styles from './Text.module.css';

export type TextElement =
  | 'p'
  | 'span'
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'label'
  | 'strong';

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type TextWeight = 'regular' | 'medium' | 'semibold';
export type TextTone = 'default' | 'muted' | 'danger' | 'inverse';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /**
   * The element to render. Heading level is a semantic decision, so it is
   * chosen explicitly rather than inferred from the visual size.
   */
  as?: TextElement;
  size?: TextSize;
  weight?: TextWeight;
  tone?: TextTone;
  /** Tabular monospace — use for identifiers and numeric cells. */
  mono?: boolean;
  children?: ReactNode;
}

export function Text({
  as: Component = 'p',
  size = 'md',
  weight = 'regular',
  tone = 'default',
  mono = false,
  className,
  children,
  ...rest
}: TextProps) {
  return (
    <Component
      {...rest}
      className={cx(
        styles.text,
        styles[size],
        styles[weight],
        styles[tone],
        mono && styles.mono,
        className,
      )}
    >
      {children}
    </Component>
  );
}
