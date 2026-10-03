import type { ReactNode } from 'react';
import { Text } from '../atoms/Text';
import { cx } from '../utils/cx';
import { EmptyState } from './EmptyState';
import styles from './DataTable.module.css';

export interface DataTableColumn<Row> {
  /** Stable identifier, also the React key for the cell. */
  key: string;
  header: ReactNode;
  /** Defaults to `String(row[key])` when the column key is a field name. */
  render?: (row: Row) => ReactNode;
  align?: 'left' | 'right';
  /** Any CSS width, e.g. `'120px'` or `'20%'`. */
  width?: string;
}

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  /** Stable row identity. Required — index keys break on refresh. */
  getRowKey: (row: Row, index: number) => string;
  /**
   * Describes the table for screen readers. Visually hidden; the visible title
   * normally lives on the surrounding Card.
   */
  caption: string;
  loading?: boolean;
  /** Shown when `rows` is empty and `loading` is false. */
  empty?: ReactNode;
  className?: string;
}

/**
 * A plain, read-only table.
 *
 * Deliberately has no sorting, paging, filtering, selection, or virtualisation.
 * Those are the features that turn a 200-line component into a permanent
 * maintenance commitment, and no app on the platform needs them yet. Rows
 * arrive already ordered by the backend.
 */
export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  caption,
  loading = false,
  empty,
  className,
}: DataTableProps<Row>) {
  const showState = loading || rows.length === 0;

  return (
    <div className={cx(styles.wrapper, className)}>
      <table className={styles.table}>
        <caption className={styles.caption}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={column.width ? { width: column.width } : undefined}
                className={cx(
                  styles.th,
                  column.align === 'right' && styles.alignRight,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody aria-busy={loading || undefined}>
          {showState ? (
            <tr>
              <td colSpan={columns.length} className={styles.stateCell}>
                <div className={styles.state}>
                  {loading ? (
                    <Text size="sm" tone="muted" style={{ textAlign: 'center' }}>
                      Loading…
                    </Text>
                  ) : (
                    (empty ?? <EmptyState title="No rows to show" />)
                  )}
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={getRowKey(row, index)} className={styles.tr}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cx(
                      styles.td,
                      column.align === 'right' && styles.alignRight,
                    )}
                  >
                    {column.render
                      ? column.render(row)
                      : String(
                          (row as Record<string, unknown>)[column.key] ?? '',
                        )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
