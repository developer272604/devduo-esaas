import { useEffect, useRef } from 'react';
import { fileToDataUrl } from '@/lib/image';
import { useTemplateStore } from '@/store/template';
import { useCustomize } from '@/store/customize';
import { useUiStore } from '@/store/ui';

/**
 * One hidden file input for the whole site. Any image slot asks for it through the store,
 * which keeps the picker out of the markup of every section.
 */
export function ImagePicker() {
  const pick = useCustomize((s) => s.pick);
  const input = useRef<HTMLInputElement>(null);
  const slot = useRef<string | null>(null);

  useEffect(() => {
    if (!pick) return;
    slot.current = pick.slot;
    input.current?.click();
  }, [pick]);

  return (
    <input
      ref={input}
      type="file"
      accept="image/*"
      hidden
      data-testid="image-input"
      data-no-capture
      onChange={async (e) => {
        const file = e.target.files?.[0];
        e.target.value = ''; // lets the same file be chosen again
        const target = slot.current;
        if (!file || !target) return;
        const result = await fileToDataUrl(file);
        const ui = useUiStore.getState();
        if (!result.ok) return ui.showToast(result.error);
        useCustomize.getState().setImage(useTemplateStore.getState().tpl, target, result.url);
        ui.showToast('Image changed. It stays after a refresh.');
      }}
    />
  );
}
