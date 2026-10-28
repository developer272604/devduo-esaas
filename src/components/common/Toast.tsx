import { useEffect } from 'react';
import Link from '@/components/common/Link';
import { useUiStore } from '@/store/ui';

export function ToastHost() {
  const toast = useUiStore((s) => s.toast);
  const hide = useUiStore((s) => s.hideToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hide, 3600);
    return () => clearTimeout(t);
  }, [toast, hide]);

  return (
    <div id="toast" data-no-capture role="status" aria-live="polite" className={toast ? 'on' : ''}>
      {toast && (
        <>
          <span>{toast.message}</span>
          {toast.action && (
            <Link href={toast.action.href} onClick={hide}>
              {toast.action.label}
            </Link>
          )}
        </>
      )}
    </div>
  );
}
