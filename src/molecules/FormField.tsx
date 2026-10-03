import { cloneElement, useId } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { cx } from '../utils/cx';
import styles from './FormField.module.css';

/** The subset of props FormField injects into its control. */
export interface FormFieldControlProps {
  id?: string;
  'aria-describedby'?: string;
  required?: boolean;
  invalid?: boolean;
}

export interface FormFieldProps {
  label: ReactNode;
  /** Supporting copy, announced to screen readers via `aria-describedby`. */
  hint?: ReactNode;
  /** When present the control is marked invalid and the message is announced. */
  error?: ReactNode;
  required?: boolean;
  /** Overrides the generated control id. */
  id?: string;
  className?: string;
  /** Exactly one control — Input, Select, or anything with the same props. */
  children: ReactElement<FormFieldControlProps>;
}

/**
 * Pairs a real `<label>` with a control and wires up the accessibility
 * attributes, so callers cannot forget them: the control gets the id the label
 * points at, plus `aria-describedby` for the hint and error text.
 */
export function FormField({
  label,
  hint,
  error,
  required = false,
  id,
  className,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const controlId = id ?? children.props.id ?? generatedId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;

  const describedBy =
    [children.props['aria-describedby'], hintId, errorId]
      .filter(Boolean)
      .join(' ') || undefined;

  const control = cloneElement(children, {
    id: controlId,
    'aria-describedby': describedBy,
    required: required || children.props.required,
    invalid: Boolean(error) || children.props.invalid,
  });

  return (
    <div className={cx(styles.field, className)}>
      <label className={styles.label} htmlFor={controlId}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {control}

      {hint ? (
        <span id={hintId} className={cx(styles.message, styles.hint)}>
          {hint}
        </span>
      ) : null}

      {error ? (
        <span
          id={errorId}
          className={cx(styles.message, styles.error)}
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}
