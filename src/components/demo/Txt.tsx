import type { ClipboardEvent, ElementType, FormEvent, KeyboardEvent, MouseEvent } from 'react';
import { useTemplateStore } from '@/store/template';
import { useCustomize } from '@/store/customize';
import { productDescId, productNameId } from '@/lib/textIds';
import { useEditMode } from './useEditMode';
import { clampText, limitFor, roomLeft } from '@/lib/textLimit';

/** The text for `id`: the visitor's edit if there is one, otherwise `fallback`. */
export function useText(id: string, fallback: string): string {
  const tpl = useTemplateStore((s) => s.tpl);
  return useCustomize((s) => s.texts[tpl]?.[id]) ?? fallback;
}

export { productNameId, productDescId };
/** A product's display name, including any edit the visitor made. */
export const useProductName = (id: string, fallback: string) => useText(productNameId(id), fallback);

/** Lookup for product names inside loops, where a hook per row is not possible. */
export function useNameOf(): (id: string, fallback: string) => string {
  const tpl = useTemplateStore((s) => s.tpl);
  const texts = useCustomize((s) => s.texts[tpl]);
  return (id, fallback) => texts?.[productNameId(id)] ?? fallback;
}

type Props = {
  /** Stable slot id, for example `home.0.title`. Edits are saved per template under this id. */
  id: string;
  /** The template's own text. */
  text: string;
  as?: ElementType;
  className?: string;
  /** Character limit. Defaults to 200, or 600 for paragraphs. */
  max?: number;
};

const selectedLength = () => window.getSelection()?.toString().length ?? 0;
const clean = (v: string) => v.replace(/\s+/g, ' ').trim();

/**
 * Text that becomes editable in place while edit mode is on. Enter saves, Escape cancels,
 * clearing the text restores the original. Outside edit mode it renders as plain text.
 */
export function Txt({ id, text, as: Tag = 'span', className, max }: Props) {
  const tpl = useTemplateStore((s) => s.tpl);
  const override = useCustomize((s) => s.texts[tpl]?.[id]);
  const editing = useEditMode();
  const value = override ?? text;
  const Component = Tag as ElementType;
  const limit = limitFor(Tag, max);
  const isHeading = typeof Tag === 'string' && /^h[1-6]$/.test(Tag);

  if (!editing) return <Component className={className}>{value}</Component>;

  const commit = (el: HTMLElement) => {
    const next = clampText(clean(el.textContent ?? ''), limit);
    const { setText, clearText } = useCustomize.getState();
    if (!next || next === text) clearText(tpl, id);
    else setText(tpl, id, next);
    // Put the DOM back in step with the state, whatever the visitor typed.
    el.textContent = !next ? text : next;
  };

  return (
    <Component
      className={`${className ?? ''} editable`.trim()}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      {...(isHeading ? {} : { role: 'textbox', 'aria-multiline': Tag === 'p' })}
      tabIndex={0}
      aria-label={`Edit text: ${value}`}
      data-editable={id}
      // Editing must never follow a link or fire a button that happens to wrap the text.
      onClick={(e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        } else if (e.key === 'Escape') {
          e.currentTarget.textContent = value;
          e.currentTarget.blur();
        } else if (e.key === ' ') {
          // Some browsers swallow the space inside links and buttons.
          e.preventDefault();
          if (roomLeft(limit, e.currentTarget.textContent?.length ?? 0, selectedLength()) > 0) document.execCommand('insertText', false, ' ');
        }
      }}
      onPaste={(e: ClipboardEvent<HTMLElement>) => {
        e.preventDefault();
        const room = roomLeft(limit, e.currentTarget.textContent?.length ?? 0, selectedLength());
        document.execCommand('insertText', false, clampText(e.clipboardData.getData('text/plain'), room));
      }}
      onInput={(e: FormEvent<HTMLElement>) => {
        // Typing and drag-and-drop also respect the limit.
        const el = e.currentTarget;
        if ((el.textContent?.length ?? 0) > limit) {
          el.textContent = (el.textContent ?? '').slice(0, limit);
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => commit(e.currentTarget)}
    >
      {value}
    </Component>
  );
}
