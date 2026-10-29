import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** Every test gets its own copy of the template registry, as on a fresh page load. */
async function fresh() {
  vi.resetModules();
  return import('@/templates');
}

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  vi.doUnmock('@/templates/gadgets/config');
  document.head.querySelectorAll('link[rel=preload]').forEach((l) => l.remove());
});

describe('templates load on demand (P1)', () => {
  it('starts with none loaded, and loading one does not load the others', async () => {
    const { TEMPLATES, loadTemplate } = await fresh();
    expect(Object.keys(TEMPLATES)).toEqual([]);
    const t = await loadTemplate('fashion');
    expect(t.id).toBe('fashion');
    expect(Object.keys(TEMPLATES)).toEqual(['fashion']);
  });

  it('asking twice, or at the same time, fetches once and gives back the same object', async () => {
    const { loadTemplate } = await fresh();
    const [a, b] = await Promise.all([loadTemplate('wellness'), loadTemplate('wellness')]);
    expect(a).toBe(b);
    expect(await loadTemplate('wellness')).toBe(a);
  });

  it('an unknown id loads the default template instead of failing', async () => {
    const { loadTemplate, DEFAULT_TEMPLATE } = await fresh();
    for (const id of ['nope', '../../etc', '__proto__', '']) expect((await loadTemplate(id)).id, id).toBe(DEFAULT_TEMPLATE);
  });

  it('getTemplate says so plainly when the catalogue has not been loaded', async () => {
    const { getTemplate, loadTemplate } = await fresh();
    expect(() => getTemplate('herbal')).toThrow(/not loaded yet/);
    await loadTemplate('herbal');
    expect(getTemplate('herbal').name).toBe('Ooty Herbals');
    expect(getTemplate('does-not-exist').id).toBe('herbal'); // unknown id: the default
    expect(getTemplate(undefined).id).toBe('herbal');
  });

  it('the small meta tables are ready without loading anything', async () => {
    const { TEMPLATE_META, TEMPLATE_IDS, isTemplateId } = await fresh();
    expect(TEMPLATE_IDS).toEqual(['herbal', 'gadgets', 'fashion', 'marketplace', 'wellness']);
    for (const m of Object.values(TEMPLATE_META)) {
      expect(m).toMatchObject({ id: expect.any(String), name: expect.any(String), logo: expect.any(String), tag: expect.any(String) });
      expect(m.theme.primary).toMatch(/^#[0-9a-f]{6}$/i);
      expect(Object.keys(m)).not.toContain('products'); // the catalogue is not in the meta
    }
    expect(isTemplateId('herbal')).toBe(true);
    for (const bad of ['', 'constructor', 'toString', '__proto__', 5, null, undefined]) expect(isTemplateId(bad), String(bad)).toBe(false);
  });

  it('a failed download is reported, is not remembered, and can be tried again', async () => {
    vi.resetModules();
    vi.doMock('@/templates/gadgets/config', () => {
      throw new Error('network down');
    });
    const { loadTemplate, TEMPLATES } = await import('@/templates');
    await expect(loadTemplate('gadgets')).rejects.toThrow();
    await expect(loadTemplate('gadgets')).rejects.toThrow(); // asked again, not stuck on the first failure
    expect(TEMPLATES.gadgets).toBeUndefined();
    expect((await loadTemplate('herbal')).id).toBe('herbal'); // other templates are unaffected
  });

  it('switching to a template that cannot load keeps the current one and says so', async () => {
    vi.resetModules();
    vi.doMock('@/templates/gadgets/config', () => {
      throw new Error('network down');
    });
    const { loadTemplate } = await import('@/templates');
    await loadTemplate('herbal');
    const { switchTemplate } = await import('@/store/actions');
    const { useTemplateStore } = await import('@/store/template');
    const { useUiStore } = await import('@/store/ui');
    useTemplateStore.setState({ tpl: 'herbal' });
    const nav = vi.fn();
    await switchTemplate('gadgets', nav);
    expect(useTemplateStore.getState().tpl).toBe('herbal');
    expect(nav).not.toHaveBeenCalled();
    expect(useUiStore.getState().toast?.message).toMatch(/Could not load that template/);
  });
});

describe('starting up (P1, P4)', () => {
  it('reads the saved template, and falls back to the default for anything odd', async () => {
    await fresh();
    const { savedTemplateId } = await import('@/templates/boot');
    expect(savedTemplateId()).toBe('herbal');
    for (const [raw, expected] of [
      [JSON.stringify({ state: { tpl: 'fashion' }, version: 0 }), 'fashion'],
      [JSON.stringify({ state: { tpl: 'nope' }, version: 0 }), 'herbal'],
      [JSON.stringify({ state: { tpl: { x: 1 } }, version: 0 }), 'herbal'],
      ['{not json', 'herbal'],
      ['[]', 'herbal'],
      ['null', 'herbal'],
    ] as const) {
      window.localStorage.setItem('devduo.template', raw);
      expect(savedTemplateId(), raw).toBe(expected);
    }
  });

  it('loads the saved template before the first render, and preloads the hero picture', async () => {
    await fresh();
    window.localStorage.setItem('devduo.template', JSON.stringify({ state: { tpl: 'herbal' }, version: 0 }));
    const { loadSavedTemplate } = await import('@/templates/boot');
    const { TEMPLATES } = await import('@/templates');
    const t = await loadSavedTemplate();
    expect(t.id).toBe('herbal');
    expect(Object.keys(TEMPLATES)).toEqual(['herbal']);
    const links = document.head.querySelectorAll('link[rel=preload][as=image]');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBeTruthy();
    expect(links[0].getAttribute('fetchpriority')).toBe('high');
  });

  it('a template whose hero is not a photograph preloads nothing', async () => {
    await fresh();
    window.localStorage.setItem('devduo.template', JSON.stringify({ state: { tpl: 'gadgets' }, version: 0 }));
    const { loadSavedTemplate } = await import('@/templates/boot');
    await loadSavedTemplate();
    expect(document.head.querySelectorAll('link[rel=preload]')).toHaveLength(0);
  });
});

describe('the theme font is ready for the first paint (P4)', () => {
  const stubFonts = (load: (spec: string) => Promise<unknown>) => {
    const fn = vi.fn(load);
    Object.defineProperty(document, 'fonts', { value: { load: fn }, configurable: true });
    return fn;
  };
  afterEach(() => {
    vi.useRealTimers();
    // @ts-expect-error test cleanup of the stub
    delete document.fonts;
  });

  it("picks the template's own font, or the one the visitor chose for that template", async () => {
    await fresh();
    const { savedFontFamily } = await import('@/templates/boot');
    expect(savedFontFamily()).toBe("'Lora Variable'"); // herbal's default
    window.localStorage.setItem('devduo.template', JSON.stringify({ state: { tpl: 'marketplace' }, version: 0 }));
    expect(savedFontFamily()).toBe("'Poppins'");
    window.localStorage.setItem('devduo.theme', JSON.stringify({ state: { themes: { marketplace: { primary: '#2563eb', font: 'Space Grotesk', mode: 'light', radius: 'soft' } } }, version: 0 }));
    expect(savedFontFamily()).toBe("'Space Grotesk Variable'");
    window.localStorage.setItem('devduo.theme', JSON.stringify({ state: { themes: { marketplace: { font: 'Comic Sans' } } }, version: 0 }));
    expect(savedFontFamily()).toBe("'Poppins'"); // an invalid saved theme is ignored
    window.localStorage.setItem('devduo.theme', '{garbage');
    expect(savedFontFamily()).toBe("'Poppins'");
  });

  it('asks the browser for the regular, semibold and bold weights of that family', async () => {
    await fresh();
    const { loadThemeFont } = await import('@/templates/boot');
    const load = stubFonts(() => Promise.resolve([]));
    await loadThemeFont("'Poppins'");
    expect(load.mock.calls.map((c) => c[0])).toEqual(["400 1em 'Poppins'", "600 1em 'Poppins'", "700 1em 'Poppins'"]);
  });

  it('waits for the font, but never longer than the limit', async () => {
    await fresh();
    const { loadThemeFont, FONT_WAIT_MS } = await import('@/templates/boot');
    stubFonts(() => new Promise(() => undefined)); // a download that never finishes
    vi.useFakeTimers();
    let done = false;
    const p = loadThemeFont("'Poppins'").then(() => (done = true));
    await vi.advanceTimersByTimeAsync(FONT_WAIT_MS - 50);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(100);
    await p;
    expect(done).toBe(true);
  });

  it('never throws: a failed download or a browser without the font API just carries on', async () => {
    await fresh();
    const { loadThemeFont } = await import('@/templates/boot');
    stubFonts(() => Promise.reject(new Error('404')));
    await expect(loadThemeFont("'Poppins'")).resolves.toBeUndefined();
    // @ts-expect-error simulating an old browser
    delete document.fonts;
    await expect(loadThemeFont("'Poppins'")).resolves.toBeUndefined();
  });
});

describe('the first paint has the right look (P4)', () => {
  it("applies the template's own theme, or the visitor's saved one, before anything renders", async () => {
    await fresh();
    const { applySavedTheme } = await import('@/templates/boot');
    const { loadTemplate } = await import('@/templates');
    const { useThemeStore } = await import('@/store/theme');
    const root = document.documentElement;
    const market = await loadTemplate('marketplace');

    useThemeStore.setState({ themes: {} });
    applySavedTheme(market);
    expect(root.style.getPropertyValue('--primary')).toBe('#2563eb');
    expect(root.style.getPropertyValue('--font')).toContain("'Poppins'");
    expect(root.style.getPropertyValue('--bg')).toBe('#f6f8fc');

    useThemeStore.setState({ themes: { marketplace: { primary: '#be185d', font: 'Fraunces', mode: 'dark', radius: 'round' } } });
    applySavedTheme(market);
    expect(root.style.getPropertyValue('--primary')).toBe('#be185d');
    expect(root.style.getPropertyValue('--font')).toContain("'Fraunces Variable'");
    expect(root.dataset.theme).toBe('dark');
  });
});
