import { useRef, type ReactNode } from 'react';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { Icon } from './Icon';

type Props = { title: string; onClose?: () => void; children: ReactNode; labelledBy?: string };

/** Centered dialog. Pass no `onClose` for a dialog that must not be dismissed (payment in progress). */
export function Modal({ title, onClose, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);
  return (
    <div
      className="modal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="mb" role="dialog" aria-modal="true" aria-label={title} ref={ref} tabIndex={-1}>
        {onClose && (
          <button type="button" className="icon x" aria-label="Close" onClick={onClose}>
            <Icon name="x" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
