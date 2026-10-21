import { useEffect, useRef, useState } from 'react';
import type { OperatorDto } from '../../../domain/operators/operators';
import type { RoleKey } from '../../../domain/rbac/rbac.types';
import type { IssuedAccountResponse, OperatorCatalog } from './api-client';
import { ApiClientError } from './api-client';
import { IconReact } from '../../ui/IconReact';

/* ── Shared shell ────────────────────────────────────────────────────── */

interface DialogShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  labelledBy: string;
}

function DialogShell({ title, description, children, onClose, labelledBy }: DialogShellProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="ops-dialog-scrim" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="ops-dialog" role="dialog" aria-modal="true" aria-labelledby={labelledBy} ref={ref} tabIndex={-1}>
        <div>
          <h2 id={labelledBy}>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Confirm ─────────────────────────────────────────────────────────── */

interface ConfirmDialogProps {
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, body, confirmLabel, tone = 'danger', busy = false, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <DialogShell title={title} onClose={onCancel} labelledBy="ops-confirm-title">
      <p>{body}</p>
      <div className="ops-dialog__actions">
        <button type="button" className="ops-btn ops-btn--ghost" onClick={onCancel} disabled={busy}>
          انصراف
        </button>
        <button
          type="button"
          className={`ops-btn ${tone === 'danger' ? 'ops-btn--danger' : 'ops-btn--primary'}`}
          onClick={onConfirm}
          disabled={busy}
          aria-busy={busy}
        >
          {confirmLabel}
        </button>
      </div>
    </DialogShell>
  );
}

/* ── Account issue / reset ───────────────────────────────────────────── */

interface AccountDialogProps {
  operator: OperatorDto;
  catalog: OperatorCatalog;
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: { email?: string; role?: RoleKey; password?: string }) => Promise<IssuedAccountResponse>;
}

const ISSUABLE_ROLES: RoleKey[] = ['OPERATOR', 'STAFF', 'MANAGER', 'EDITOR'];

/**
 * Issue or reset an operator login. The temporary password appears once, in this
 * dialog, and cannot be retrieved again — the copy button is the only path out,
 * so the copy is deliberate and the warning is not decoration.
 */
export function AccountDialog({ operator, catalog, busy, onClose, onSubmit }: AccountDialogProps) {
  const [email, setEmail] = useState(operator.account?.email ?? operator.email ?? '');
  const [role, setRole] = useState<RoleKey>(
    (operator.account?.roles[0] as RoleKey | undefined) ?? suggestedRole(catalog, operator),
  );
  const [customPassword, setCustomPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<IssuedAccountResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setServerErrors({});
    try {
      const response = await onSubmit({
        ...(email.trim() ? { email: email.trim() } : {}),
        role,
        ...(customPassword.trim() ? { password: customPassword.trim() } : {}),
      });
      setResult(response);
    } catch (err) {
      if (err instanceof ApiClientError) setServerErrors(err.fields);
      else setServerErrors({ email: ['صدور حساب ناموفق بود.'] });
    } finally {
      setSubmitting(false);
    }
  };

  const copySecret = async () => {
    const secret = result?.account.temporaryPassword;
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (result) {
    const secret = result.account.temporaryPassword;
    return (
      <DialogShell
        title={result.account.mode === 'created' ? 'حساب ورود ساخته شد' : 'رمز عبور بازنشانی شد'}
        onClose={onClose}
        labelledBy="ops-account-done"
      >
        <p>
          {operator.displayName} اکنون می‌تواند با ایمیل <b dir="ltr">{result.account.email}</b> وارد داشبورد شود.
          {result.account.mode === 'reset' && ' همه نشست‌های قبلی این حساب بسته شد.'}
        </p>

        {secret ? (
          <div className="ops-secret">
            <span className="ops-secret__label">رمز موقت — فقط همین یک بار نمایش داده می‌شود</span>
            <span className="ops-secret__value">
              <code>{secret}</code>
              <button type="button" className="ops-btn ops-btn--sm" onClick={copySecret}>
                <IconReact name={copied ? 'check' : 'copy'} size={14} />
                {copied ? 'کپی شد' : 'کپی'}
              </button>
            </span>
          </div>
        ) : (
          <div className="ops-warnbox">
            <IconReact name="info" size={16} />
            <span>رمز انتخابی شما ثبت شد. آن را از طریق کانال امن به اپراتور اطلاع دهید.</span>
          </div>
        )}

        <div className="ops-warnbox">
          <IconReact name="warning" size={16} />
          <span>نقش دسترسی: {result.account.roles.join(' · ')} — از این پس پروفایل با همین حساب به نشست‌ها وصل می‌شود.</span>
        </div>

        <div className="ops-dialog__actions">
          <button type="button" className="ops-btn ops-btn--primary" onClick={onClose}>
            بستن
          </button>
        </div>
      </DialogShell>
    );
  }

  return (
    <DialogShell
      title={operator.account ? 'بازنشانی رمز عبور' : 'صدور حساب ورود'}
      description={
        operator.account
          ? 'رمز جدید جایگزین رمز قبلی می‌شود و همه نشست‌های فعال بسته می‌شوند.'
          : 'یک حساب ورود برای این اپراتور بسازید تا بتواند نوبت‌ها و پرونده‌های خودش را ببیند.'
      }
      onClose={onClose}
      labelledBy="ops-account-title"
    >
      <form className="ops-form" onSubmit={submit} noValidate>
        <div className="ops-field">
          <label htmlFor="acc-email">
            ایمیل ورود <span>اجباری</span>
          </label>
          <input
            id="acc-email"
            className="ops-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            dir="ltr"
            inputMode="email"
            autoComplete="email"
            placeholder="operator@tehranlaser.ir"
            aria-invalid={Boolean(serverErrors.email)}
            aria-describedby={serverErrors.email ? 'acc-email-err' : undefined}
          />
          {serverErrors.email && (
            <span className="ops-error" id="acc-email-err">
              {serverErrors.email[0]}
            </span>
          )}
        </div>

        <div className="ops-field">
          <label htmlFor="acc-role">نقش دسترسی</label>
          <select
            id="acc-role"
            className="ops-input"
            value={role}
            onChange={(event) => setRole(event.target.value as RoleKey)}
          >
            {ISSUABLE_ROLES.map((key) => {
              const definition = catalog.teamRoles.find((entry) => entry.key === key);
              return (
                <option key={key} value={key}>
                  {definition?.name ?? key}
                </option>
              );
            })}
          </select>
          <span className="ops-hint">
            {catalog.teamRoles.find((entry) => entry.key === role)?.description ?? 'دسترسی‌های این نقش از ماتریس RBAC خوانده می‌شود.'}
          </span>
        </div>

        <div className="ops-field">
          <label htmlFor="acc-password">رمز عبور دستی (اختیاری)</label>
          <input
            id="acc-password"
            className="ops-input"
            type="text"
            value={customPassword}
            onChange={(event) => setCustomPassword(event.target.value)}
            dir="ltr"
            autoComplete="new-password"
            placeholder="خالی بگذارید تا سرور رمز موقت بسازد"
            aria-invalid={Boolean(serverErrors.password)}
          />
          {serverErrors.password && <span className="ops-error">{serverErrors.password[0]}</span>}
          <span className="ops-hint">حداقل ۱۰ کاراکتر. اگر خالی بماند، رمز موقت خوانا ساخته و یک بار نمایش داده می‌شود.</span>
        </div>

        <div className="ops-warnbox">
          <IconReact name="shield" size={16} />
          <span>این عملیات در گزارش وقایع ثبت می‌شود و به مجوز «صدور حساب اپراتور» نیاز دارد.</span>
        </div>

        <div className="ops-dialog__actions">
          <button type="button" className="ops-btn ops-btn--ghost" onClick={onClose} disabled={submitting || busy}>
            انصراف
          </button>
          <button type="submit" className="ops-btn ops-btn--primary" disabled={submitting || busy} aria-busy={submitting}>
            <IconReact name={submitting ? 'refresh' : 'lock'} size={15} />
            {operator.account ? 'بازنشانی رمز' : 'ساخت حساب'}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

function suggestedRole(catalog: OperatorCatalog, operator: OperatorDto): RoleKey {
  const clinical = catalog.roles.find((entry) => entry.key === operator.roleKey);
  return clinical?.accessRole ?? 'OPERATOR';
}
