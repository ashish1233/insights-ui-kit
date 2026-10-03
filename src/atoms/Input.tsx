import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import styles from './Field.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Draws the error border and sets `aria-invalid`. Usually set by FormField. */
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, className, ...rest },
  ref,
) {
  return (
    <input
      {...rest}
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cx(styles.control, invalid && styles.invalid, className)}
    />
  );
});
