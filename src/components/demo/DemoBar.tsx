import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { captureSite } from '@/lib/screenshot';
import { useCustomize } from '@/store/customize';
import { useUiStore } from '@/store/ui';
import { useText } from './Txt';
import { useTemplate } from '@/store/template';
import { usePathname } from '@/lib/nav';
import { HOME_PATH } from './useEditMode';

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

/**
 * The floating bar at the bottom: edit mode, full screen, screenshot.
 * It is left out of screenshots and fades while the site is in full screen.
 */
export function DemoBar() {
  const template = useTemplate();
  const brand = useText('brand.name', template.name);
  const onHome = usePathname() === HOME_PATH;
  const editing = useCustomize((s) => s.editing) && onHome;
  const setEditing = useCustomize((s) => s.setEditing);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);

  // Editing belongs to the home page: leaving it switches edit mode off.
  useEffect(() => {
    if (!onHome) setEditing(false);
  }, [onHome, setEditing]);

  // Full screen hides the tools. If the browser refuses real full screen, the hidden-tools view still works.
  useEffect(() => {
    document.documentElement.classList.toggle('is-preview', preview);
    return () => document.documentElement.classList.remove('is-preview');
  }, [preview]);

  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setPreview(false);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullScreen = useCallback(async () => {
    if (preview) {
      setPreview(false);
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
      return;
    }
    setEditing(false);
    useUiStore.getState().setSettingsOpen(false);
    setPreview(true);
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {
      /* not allowed here: stay in the hidden-tools view */
    }
  }, [preview, setEditing]);

  const screenshot = useCallback(async () => {
    const ui = useUiStore.getState();
    setBusy(true);
    ui.setSettingsOpen(false);
    ui.hideToast();
    await nextFrame();
    try {
      const shot = await captureSite(brand);
      useUiStore.getState().openModal({ t: 'shot', url: shot.url, blob: shot.blob, brand });
    } catch {
      useUiStore.getState().showToast('We could not capture the page. Try again, or use your device screenshot.');
    } finally {
      setBusy(false);
    }
  }, [brand]);

  return (
    <>
      {editing && !preview && (
        <div className="demo-hint" role="status" data-no-capture>
          Edit mode (home page). Click any text to type over it. Click an image to replace it.
        </div>
      )}
      <div className="demo-bar" data-tour="bar" role="toolbar" aria-label="Demo tools" data-no-capture>
        {onHome && (
          <button type="button" className={editing ? 'on' : ''} aria-pressed={editing} data-tour="edit" onClick={() => setEditing(!editing)} disabled={preview}>
            <Icon name="pencil" size={18} />
            <span>{editing ? 'Done editing' : 'Edit'}</span>
          </button>
        )}
        <button type="button" aria-pressed={preview} data-testid="fullscreen" onClick={toggleFullScreen}>
          <Icon name={preview ? 'shrink' : 'expand'} size={18} />
          <span>{preview ? 'Exit full screen' : 'Full screen'}</span>
        </button>
        <button type="button" data-testid="screenshot" onClick={screenshot} disabled={busy}>
          <Icon name="camera" size={18} />
          <span>{busy ? 'Capturing…' : 'Screenshot'}</span>
        </button>
      </div>
    </>
  );
}
