import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cx } from '../utils/cx';
import styles from './Field.module.css';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  /** Renders a disabled first option, used as an empty-value prompt. */
  placeholder?: string;
  /** Draws the error border and sets `aria-invalid`. Usually set by FormField. */
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { options, placeholder, invalid = false, className, ...rest },
    ref,
  ) {
    return (
      <select
        {...rest}
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cx(
          styles.control,
          styles.select,
          invalid && styles.invalid,
          className,
        )}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  },
);
