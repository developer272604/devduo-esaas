import { useEffect, useRef } from 'react';
import { useRouter } from '@/lib/nav';
import { TEMPLATE_META } from '@/templates';
import { FONT_NAMES, type Mode, type Radius, type ThemeState } from '@/lib/types';
import { FONT_FAMILY, SWATCHES, applyTheme } from '@/lib/theme';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useTemplate } from '@/store/template';
import { themeFor, useThemeStore } from '@/store/theme';
import { switchTemplate } from '@/store/actions';
import { useUiStore } from '@/store/ui';
import { editCount, useCustomize } from '@/store/customize';
import { useDemoStore } from '@/store/demo';
import { Icon } from '@/components/common/Icon';

export function SettingsTab() {
  const open = useUiStore((s) => s.settingsOpen);
  const setOpen = useUiStore((s) => s.setSettingsOpen);
  return (
    <button type="button" className="stab" data-no-capture aria-label="Open settings" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      <Icon name="gear" size={20} />
      <span>Settings</span>
    </button>
  );
}

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o} type="button" className={value === o ? 'on' : ''} aria-pressed={value === o} onClick={() => onChange(o)}>
          {o[0].toUpperCase() + o.slice(1)}
        </button>
      ))}
    </div>
  );
}

export function SettingsDrawer() {
  const open = useUiStore((s) => s.settingsOpen);
  const setOpen = useUiStore((s) => s.setSettingsOpen);
  const modal = useUiStore((s) => s.modal);
  const template = useTemplate();
  const themes = useThemeStore((s) => s.themes);
  const setTheme = useThemeStore((s) => s.setTheme);
  const resetTheme = useThemeStore((s) => s.resetTheme);
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);
  const frame = useRef<number | null>(null);
  const theme = themeFor(themes, template);
  const edits = useCustomize((st) => editCount(st, template.id));
  const resetEdits = useCustomize((st) => st.resetTemplate);
  const startTour = useDemoStore((st) => st.startTour);

  // Escape closes the drawer, unless a dialog sits on top of it.
  useFocusTrap(panelRef, open && !modal, () => setOpen(false));

  // Keep the native colour input in step with swatches and resets, but never while the user is dragging it.
  useEffect(() => {
    const el = colorRef.current;
    if (el && document.activeElement !== el && el.value.toLowerCase() !== theme.primary.toLowerCase()) el.value = theme.primary;
  }, [theme.primary]);

  const patch = (p: Partial<ThemeState>) => setTheme(template, p);

  /** Dragging the colour input paints the page immediately and commits to the store once per frame. */
  const onColorInput = (value: string) => {
    applyTheme({ ...theme, primary: value }, template.theme.bg);
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      patch({ primary: value });
    });
  };

  const inert = open ? {} : ({ inert: '' } as object);

  return (
    <>
      <div className={`overlay${open ? ' on' : ''}`} data-no-capture onClick={() => setOpen(false)} aria-hidden="true" />
      <div id="drawer" data-no-capture className={open ? 'on' : ''} ref={panelRef} role="dialog" aria-modal={open} aria-label="Storefront settings" tabIndex={-1} {...inert}>
        <div className="dh">
          <h2>Customize storefront</h2>
          <button type="button" className="icon" aria-label="Close settings" onClick={() => setOpen(false)}>
            <Icon name="x" />
          </button>
        </div>
        <div className="db">
          <section aria-labelledby="set-tpl">
            <h3 id="set-tpl">Template</h3>
            <div className="tpls">
              {Object.values(TEMPLATE_META).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`tpl${t.id === template.id ? ' on' : ''}`}
                  aria-pressed={t.id === template.id}
                  data-template={t.id}
                  onClick={() => void switchTemplate(t.id, (href) => router.push(href))}
                >
                  <span className="te" aria-hidden="true">{t.logo}</span>
                  <b>{t.name}</b>
                  <small>{t.tag}</small>
                </button>
              ))}
            </div>
            <p className="hint">Switching template swaps the home page and every product, and clears your cart and wishlist.</p>
          </section>

          <section aria-labelledby="set-colour">
            <h3 id="set-colour">Colour</h3>
            <div className="sw">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  style={{ background: c }}
                  className={c.toLowerCase() === theme.primary.toLowerCase() ? 'on' : ''}
                  aria-label={`Colour ${c}`}
                  aria-pressed={c.toLowerCase() === theme.primary.toLowerCase()}
                  onClick={() => patch({ primary: c })}
                />
              ))}
            </div>
            <label className="cust">
              <input ref={colorRef} type="color" defaultValue={theme.primary} aria-label="Custom colour" onInput={(e) => onColorInput((e.target as HTMLInputElement).value)} />
              Custom colour
            </label>
          </section>

          <section aria-labelledby="set-font">
            <h3 id="set-font">Font</h3>
            <div className="fonts">
              {FONT_NAMES.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={f === theme.font ? 'on' : ''}
                  aria-pressed={f === theme.font}
                  style={{ fontFamily: `${FONT_FAMILY[f]}, system-ui, sans-serif` }}
                  onClick={() => patch({ font: f })}
                >
                  {f}
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="set-mode">
            <h3 id="set-mode">Mode</h3>
            <Segmented<Mode> label="Mode" value={theme.mode} options={['light', 'dark']} onChange={(mode) => patch({ mode })} />
          </section>

          <section aria-labelledby="set-radius">
            <h3 id="set-radius">Corners</h3>
            <Segmented<Radius> label="Corners" value={theme.radius} options={['sharp', 'soft', 'round']} onChange={(radius) => patch({ radius })} />
          </section>

          <section aria-labelledby="set-edits">
            <h3 id="set-edits">Your edits</h3>
            <p className="hint tight">Text and images you changed on this template. They stay after a refresh and when you change the theme.</p>
            <button
              type="button"
              className="btn ghost block"
              disabled={edits === 0}
              onClick={() => {
                resetEdits(template.id);
                useUiStore.getState().showToast('Text and images are back to the template originals.');
              }}
            >
              {edits ? `Reset ${edits} edit${edits === 1 ? '' : 's'}` : 'No edits yet'}
            </button>
          </section>

          <section className="last">
            <button type="button" className="btn ghost block" onClick={() => resetTheme(template)}>
              Reset to template look
            </button>
            <button
              type="button"
              className="btn ghost block gap"
              onClick={() => {
                setOpen(false);
                startTour();
              }}
            >
              Show the tour again
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
