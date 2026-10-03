import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import type { SelectOption } from '../atoms/Select';
import { Text } from '../atoms/Text';
import { Alert } from '../molecules/Alert';
import { FormField } from '../molecules/FormField';
import { cx } from '../utils/cx';
import styles from './LoginPanel.module.css';

export interface LoginCredentials {
  tenantId: string;
  subject: string;
}

export interface LoginPanelProps {
  appName: string;
  description?: ReactNode;
  /**
   * Called with trimmed values once both fields are filled in. Rejecting or
   * throwing is fine — surface the message through `error`.
   */
  onSubmit: (credentials: LoginCredentials) => void | Promise<void>;
  /**
   * When supplied, the tenant is chosen from a list instead of typed. An app
   * bound to a single tenant passes a one-item list.
   */
  tenants?: SelectOption[];
  defaultTenantId?: string;
  defaultSubject?: string;
  busy?: boolean;
  /** Sign-in failure, or an expired-session notice from a previous visit. */
  error?: ReactNode;
  /**
   * Heading for `error`. Worth overriding for an expired session — the user did
   * not fail to sign in, so the default would misdescribe what happened.
   */
  errorTitle?: ReactNode;
  /** Centres the panel on a full-height page. */
  standalone?: boolean;
  className?: string;
}

/**
 * The sign-in form. It collects a tenant and a user and hands them back — it
 * does not know how tokens are issued, which keeps it usable against the
 * identity stub and against a real issuer without change.
 */
export function LoginPanel({
  appName,
  description,
  onSubmit,
  tenants,
  defaultTenantId = '',
  defaultSubject = '',
  busy = false,
  error,
  errorTitle = 'Could not sign in',
  standalone = true,
  className,
}: LoginPanelProps) {
  const [tenantId, setTenantId] = useState(defaultTenantId);
  const [subject, setSubject] = useState(defaultSubject);
  const [touched, setTouched] = useState(false);

  const trimmedTenant = tenantId.trim();
  const trimmedSubject = subject.trim();
  const tenantError = touched && !trimmedTenant ? 'Tenant is required.' : undefined;
  const subjectError = touched && !trimmedSubject ? 'User is required.' : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (!trimmedTenant || !trimmedSubject) return;
    void onSubmit({ tenantId: trimmedTenant, subject: trimmedSubject });
  };

  const panel = (
    <Card className={cx(styles.panel, className)} padding="md">
      <div className={styles.intro}>
        <Text as="h1" size="xl" weight="semibold">
          {appName}
        </Text>
        <Text size="sm" tone="muted">
          {description ?? 'Sign in to continue.'}
        </Text>
      </div>

      {error ? (
        <div style={{ marginBottom: 'var(--ins-space-lg)' }}>
          <Alert tone="danger" title={errorTitle}>
            {error}
          </Alert>
        </div>
      ) : null}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <FormField label="Tenant" required error={tenantError}>
          {tenants ? (
            <Select
              name="tenantId"
              options={tenants}
              placeholder="Select a tenant"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
            />
          ) : (
            <Input
              name="tenantId"
              autoComplete="organization"
              placeholder="e.g. finance-reporting"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
            />
          )}
        </FormField>

        <FormField
          label="User"
          required
          hint="The person this session acts as."
          error={subjectError}
        >
          <Input
            name="subject"
            autoComplete="username"
            placeholder="e.g. a.analyst"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </FormField>

        <Button type="submit" variant="primary" busy={busy} fullWidth>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Card>
  );

  return standalone ? <div className={styles.page}>{panel}</div> : panel;
}
