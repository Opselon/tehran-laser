/** Shared admin-console browser helpers — ONE implementation of the things
 *  every console screen was re-inventing.
 *
 *  Why this file exists: `showToast` had been copy-pasted into five pages with
 *  three different signatures, and the `services` variant dropped the error
 *  flag — so a failed save rendered a success-styled toast. That is not a
 *  styling problem, it is a truth problem, and it is why this lives in one
 *  place with one contract.
 *
 *  Contract:
 *   - `TLToast.show(message, variant)` never throws, even before the container
 *     exists, so a page can call it from a catch block safely.
 *   - The live region is `aria-live="polite"` and is created once per document;
 *     screen readers therefore announce async results (the console had no
 *     live region at all before this).
 *   - Toasts pause their auto-dismiss timer on hover AND on focus, so a slow
 *     reader is never robbed of the message.
 *   - `TLAdmin.confirm()` returns a promise; it is a real `<dialog>` so Esc and
 *     focus trapping come from the platform instead of hand-rolled listeners.
 */

export type ToastVariant = 'ok' | 'warn' | 'error' | 'info';

export interface ToastApi {
  show(message: string, variant?: ToastVariant, timeoutMs?: number): void;
  clear(): void;
}

export interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Renders the confirm button in the destructive style. */
  danger?: boolean;
}

export interface AdminApi {
  confirm(options: ConfirmOptions): Promise<boolean>;
  /** Clinic-local today as 'YYYY-MM-DD', computed in the browser's tz table
   *  without pulling a date library (the server remains authoritative). */
  todayLocal(): string;
}

const TOAST_HOST_ID = 'tl-toast-host';
const AUTO_DISMISS_MS = 6000;

function toastHost(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  let host = document.getElementById(TOAST_HOST_ID);
  if (host) return host;
  host = document.createElement('div');
  host.id = TOAST_HOST_ID;
  host.className = 'tl-toast-host';
  host.setAttribute('aria-live', 'polite');
  host.setAttribute('aria-atomic', 'false');
  document.body.appendChild(host);
  return host;
}

const ICONS: Record<ToastVariant, string> = {
  ok: 'M20 6 9 17l-5-5',
  warn: 'M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  error: 'M18 6 6 18M6 6l12 12',
  info: 'M12 16v-4m0-4h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
};

function toastIcon(variant: ToastVariant): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', ICONS[variant]);
  svg.appendChild(path);
  return svg;
}

export const TLToast: ToastApi = {
  show(message, variant = 'info', timeoutMs = AUTO_DISMISS_MS) {
    const host = toastHost();
    if (!host) return;
    const text = String(message ?? '').trim();
    if (!text) return;

    const toast = document.createElement('div');
    toast.className = `tl-toast tl-toast--${variant}`;
    toast.setAttribute('role', variant === 'error' ? 'alert' : 'status');

    const iconWrap = document.createElement('span');
    iconWrap.className = 'tl-toast__icon';
    iconWrap.appendChild(toastIcon(variant));

    const body = document.createElement('span');
    body.className = 'tl-toast__text';
    body.textContent = text;

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'tl-toast__close';
    close.setAttribute('aria-label', 'بستن پیام');
    close.textContent = '×';

    toast.appendChild(iconWrap);
    toast.appendChild(body);
    toast.appendChild(close);
    host.appendChild(toast);

    let timer = 0;
    const dismiss = () => {
      window.clearTimeout(timer);
      toast.classList.add('tl-toast--leaving');
      window.setTimeout(() => toast.remove(), 180);
    };
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(dismiss, timeoutMs);
    };

    close.addEventListener('click', dismiss);
    /* Pause on hover and on keyboard focus: a 6s countdown is plenty when you
       are looking at the message and hostile when you are not. */
    toast.addEventListener('mouseenter', () => window.clearTimeout(timer));
    toast.addEventListener('mouseleave', arm);
    toast.addEventListener('focusin', () => window.clearTimeout(timer));
    toast.addEventListener('focusout', arm);
    arm();
  },

  clear() {
    document.getElementById(TOAST_HOST_ID)?.replaceChildren();
  },
};

function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const dialog = document.createElement('dialog');
    dialog.className = 'tl-confirm';

    const title = document.createElement('h2');
    title.className = 'tl-confirm__title';
    title.textContent = options.title;

    dialog.appendChild(title);

    if (options.body) {
      const body = document.createElement('p');
      body.className = 'tl-confirm__body';
      body.textContent = options.body;
      dialog.appendChild(body);
    }

    const actions = document.createElement('div');
    actions.className = 'tl-confirm__actions';

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'tl-confirm__btn';
    cancel.textContent = options.cancelLabel ?? 'انصراف';

    const confirm = document.createElement('button');
    confirm.type = 'button';
    confirm.className = `tl-confirm__btn tl-confirm__btn--primary${
      options.danger ? ' tl-confirm__btn--danger' : ''
    }`;
    confirm.textContent = options.confirmLabel ?? 'تأیید';

    actions.appendChild(cancel);
    actions.appendChild(confirm);
    dialog.appendChild(actions);

    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      dialog.close();
      dialog.remove();
      resolve(value);
    };

    cancel.addEventListener('click', () => finish(false));
    confirm.addEventListener('click', () => finish(true));
    /* `cancel` fires on Esc — resolve as a decline rather than hanging forever. */
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      finish(false);
    });

    document.body.appendChild(dialog);
    dialog.showModal();
    confirm.focus();
  });
}

export const TLAdmin: AdminApi = {
  confirm: confirmDialog,
  todayLocal() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    /* en-CA renders YYYY-MM-DD, which is exactly the contract the API wants. */
    return parts;
  },
};

/** Persian digits for any number/string the console prints. */
export function faDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.charAt(Number(d)));
}

/** Persist a small UI preference (density, filters) with a guard so a private
 *  browsing mode that throws on `localStorage` never breaks a screen. */
export function readPref(key: string, fallback: string): string {
  try {
    return window.localStorage.getItem(`tl.admin.${key}`) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writePref(key: string, value: string): void {
  try {
    window.localStorage.setItem(`tl.admin.${key}`, value);
  } catch {
    /* storage unavailable — the preference simply does not persist */
  }
}

/** Debounce for search inputs; keeps one timer per call site. */
export function debounce<T extends (...args: never[]) => void>(fn: T, waitMs = 220): T {
  let timer = 0;
  return ((...args: never[]) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), waitMs);
  }) as T;
}
