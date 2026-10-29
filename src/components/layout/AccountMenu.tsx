import { useEffect, useRef, useState } from 'react';
import Link from '@/components/common/Link';
import { Icon } from '@/components/common/Icon';
import { useAuthStore } from '@/store/auth';
import { useUiStore } from '@/store/ui';

/** The account button and its small menu. `ooty` also shows the two-line "Hello, Sign in" label. */
export function AccountMenu({ variant = 'icon' }: { variant?: 'icon' | 'ooty' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const openModal = useUiStore((s) => s.openModal);
  const toast = useUiStore((s) => s.showToast);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      btn.current?.focus(); // focus goes back to the button that opened it
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const first = String(user?.name ?? '').trim().split(' ')[0];

  return (
    <div
      className={`acct${variant === 'ooty' ? ' ot-acct' : ''}`}
      ref={ref}
      onBlur={(e) => {
        if (open && !ref.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button ref={btn} type="button" className="icon" aria-label="Account" aria-expanded={open} aria-controls="acct-menu" onClick={() => setOpen((o) => !o)}>
        {user ? <b>{(String(user.name ?? '').trim()[0] || 'U').toUpperCase()}</b> : <Icon name="user" />}
        {variant === 'ooty' && (
          <span className="ot-acct-l" aria-hidden="true">
            <small>Hello, {user ? first || 'there' : 'Sign in'}</small>
            <b>Account &amp; orders</b>
          </span>
        )}
      </button>
      {open && (
        <div className="menu" id="acct-menu">
          {user ? (
            <>
              <div className="who">
                {user.name}
                <br />+91 {user.phone}
              </div>
              <Link href="/orders">My orders</Link>
              <Link href="/wishlist">Wishlist</Link>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  setOpen(false);
                  toast('Signed out');
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openModal({ t: 'auth' });
                }}
              >
                Sign in
              </button>
              <Link href="/orders">My orders</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
