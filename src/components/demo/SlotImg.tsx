import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import Img from '@/components/common/Img';
import { Icon } from '@/components/common/Icon';
import { useTemplateStore } from '@/store/template';
import { useCustomize } from '@/store/customize';
import { useEditMode } from './useEditMode';

/** The replacement image for a slot, if the visitor chose one. */
export function useSlotImage(slot: string): string | undefined {
  const tpl = useTemplateStore((s) => s.tpl);
  return useCustomize((s) => s.images[tpl]?.[slot]);
}

const swallow = (e: MouseEvent | KeyboardEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

/** The small corner controls: pick a new image, and remove the custom one. */
export function ImageControls({ slot }: { slot: string }) {
  const tpl = useTemplateStore((s) => s.tpl);
  const custom = useSlotImage(slot) !== undefined;
  const { requestImage, clearImage } = useCustomize.getState();
  const act = (fn: () => void) => ({
    onClick: (e: MouseEvent) => {
      swallow(e);
      fn();
    },
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        swallow(e);
        fn();
      }
    },
  });
  return (
    <span className="img-edit" data-no-capture-edit>
      <span className="img-edit-main" role="button" tabIndex={0} aria-label="Change image" title="Change image" data-image-slot={slot} {...act(() => requestImage(slot))}>
        <Icon name="camera" size={16} />
      </span>
      {custom && (
        <span className="img-edit-remove" role="button" tabIndex={0} aria-label="Remove custom image" title="Remove custom image" {...act(() => clearImage(tpl, slot))}>
          <Icon name="x" size={12} />
        </span>
      )}
    </span>
  );
}

type Props = {
  slot: string;
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Shown when there is no image at all (for example the emoji tile of a category). */
  fallback?: ReactNode;
};

/** Fills its positioned parent with the template's image, or the visitor's replacement for `slot`. */
export function SlotImg({ slot, src, alt, className = '', sizes, priority, fallback }: Props) {
  const custom = useSlotImage(slot);
  const editing = useEditMode();
  const url = custom ?? src;
  const pick = () => useCustomize.getState().requestImage(slot);
  return (
    <>
      {url ? (
        <Img
          src={url}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`${className}${editing ? ' img-editable' : ''}`.trim()}
          {...(editing
            ? {
                onClick: (e: MouseEvent) => {
                  swallow(e);
                  pick();
                },
              }
            : {})}
        />
      ) : (
        fallback
      )}
      {editing && <ImageControls slot={slot} />}
    </>
  );
}
