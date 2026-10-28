import { beforeEach, describe, expect, it } from 'vitest';
import { CUSTOM_KEY, editCount, useCustomize } from '@/store/customize';
import { useThemeStore } from '@/store/theme';
import { useDemoStore } from '@/store/demo';
import { TEMPLATES } from '@/templates';
import { productNameId } from '@/lib/textIds';

beforeEach(() => {
  useCustomize.setState({ texts: {}, images: {}, editing: false, pick: null });
  useDemoStore.setState({ toured: false, reopened: false });
  window.localStorage.clear();
});

describe('text and image edits', () => {
  it('keeps edits per template', () => {
    const c = useCustomize.getState();
    c.setText('herbal', 'home.0.title', 'My honey');
    c.setText('fashion', 'home.0.title', 'My saree');
    expect(useCustomize.getState().texts.herbal['home.0.title']).toBe('My honey');
    expect(useCustomize.getState().texts.fashion['home.0.title']).toBe('My saree');
  });

  it('removes a single edit and leaves the rest', () => {
    const c = useCustomize.getState();
    c.setImage('herbal', 'home.0.image', 'data:image/png;base64,AAA');
    c.setImage('herbal', 'cat.honey', 'data:image/png;base64,BBB');
    c.clearImage('herbal', 'home.0.image');
    expect(useCustomize.getState().images.herbal).toEqual({ 'cat.honey': 'data:image/png;base64,BBB' });
  });

  it('counts and resets the edits of one template only', () => {
    const c = useCustomize.getState();
    c.setText('herbal', 'a', 'x');
    c.setImage('herbal', 'b', 'data:image/png;base64,AAA');
    c.setText('gadgets', 'a', 'y');
    expect(editCount(useCustomize.getState(), 'herbal')).toBe(2);
    c.resetTemplate('herbal');
    expect(editCount(useCustomize.getState(), 'herbal')).toBe(0);
    expect(editCount(useCustomize.getState(), 'gadgets')).toBe(1);
  });

  it('is not touched by theme changes', () => {
    useCustomize.getState().setText('herbal', 'home.0.title', 'My honey');
    useCustomize.getState().setImage('herbal', 'home.0.image', 'data:image/png;base64,AAA');
    useThemeStore.getState().setTheme(TEMPLATES.herbal, { primary: '#be185d', font: 'Inter', mode: 'dark', radius: 'round' });
    useThemeStore.getState().resetTheme(TEMPLATES.herbal);
    expect(useCustomize.getState().texts.herbal['home.0.title']).toBe('My honey');
    expect(useCustomize.getState().images.herbal['home.0.image']).toBeTruthy();
  });

  it('saves texts and images to localStorage but never the edit-mode switch', () => {
    const c = useCustomize.getState();
    c.setEditing(true);
    c.setText('herbal', 'brand.name', 'My Store');
    const saved = JSON.parse(window.localStorage.getItem(CUSTOM_KEY) ?? '{}');
    expect(saved.state.texts.herbal['brand.name']).toBe('My Store');
    expect(saved.state).not.toHaveProperty('editing');
    expect(saved.state).not.toHaveProperty('pick');
  });

  it('asks for the file picker with a fresh request each time', () => {
    const c = useCustomize.getState();
    c.requestImage('home.0.image');
    const first = useCustomize.getState().pick;
    c.requestImage('home.0.image');
    expect(useCustomize.getState().pick?.nonce).toBe((first?.nonce ?? 0) + 1);
  });

  it('names product text slots by product id', () => {
    expect(productNameId('h1')).toBe('product.h1.name');
  });
});

describe('first-visit tour', () => {
  it('stays closed once skipped and can be reopened', () => {
    expect(useDemoStore.getState().toured).toBe(false);
    useDemoStore.getState().endTour();
    expect(useDemoStore.getState().toured).toBe(true);
    useDemoStore.getState().startTour();
    expect(useDemoStore.getState().reopened).toBe(true);
    useDemoStore.getState().endTour();
    expect(useDemoStore.getState().reopened).toBe(false);
    expect(JSON.parse(window.localStorage.getItem('devduo.demo') ?? '{}').state.toured).toBe(true);
  });
});
