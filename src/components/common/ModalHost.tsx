import { useEffect } from 'react';
import { usePathname } from '@/lib/nav';
import { useUiStore } from '@/store/ui';
import { AuthModal } from '@/components/auth/AuthModal';
import { Modal } from './Modal';

export function ModalHost() {
  const modal = useUiStore((s) => s.modal);
  const close = useUiStore((s) => s.closeModal);
  const pathname = usePathname();
  const busy = modal?.t === 'busy';

  useEffect(() => {
    if (busy && pathname.startsWith('/success')) useUiStore.setState({ modal: null });
  }, [busy, pathname]);

  if (!modal) return null;

  if (modal.t === 'auth') return <AuthModal />;

  if (modal.t === 'confirm') {
    return (
      <Modal title={modal.title} onClose={close}>
        <h2>{modal.title}</h2>
        <p>{modal.text}</p>
        <div className="row2">
          <button type="button" className="btn ghost block" onClick={close}>
            Cancel
          </button>
          <button
            type="button"
            className="btn block"
            data-autofocus
            onClick={() => {
              const fn = modal.onYes;
              useUiStore.setState({ modal: null, afterAuth: null });
              fn();
            }}
          >
            {modal.yes}
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={modal.title}>
      <div className="busy">
        <div className="spin" aria-hidden="true" />
        <h2>{modal.title}</h2>
        <p>{modal.text}</p>
      </div>
    </Modal>
  );
}
