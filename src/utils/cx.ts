type ClassValue = string | false | null | undefined;

/** Joins truthy class names. Deliberately tiny — no `clsx` dependency. */
export const cx = (...values: ClassValue[]): string =>
  values.filter(Boolean).join(' ');
