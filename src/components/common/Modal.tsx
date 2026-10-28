import { useRef, type ReactNode } from 'react';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { Icon } from './Icon';

type Props = { title: string; onClose?: () => void; children: ReactNode; wide?: boolean };

/** Centered dialog. Pass no `onClose` for a dialog that must not be dismissed (payment in progress). */
export function Modal({ title, onClose, children, wide }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);
  return (
    <div
      className="modal"
      data-no-capture
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={`mb${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} ref={ref} tabIndex={-1}>
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
