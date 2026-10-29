import { MAX_PARAGRAPH, MAX_TEXT } from './constants';

/** Longest text an editable slot accepts. Paragraphs get more room than headings and labels. */
export const limitFor = (tag: unknown, explicit?: number): number => explicit ?? (tag === 'p' ? MAX_PARAGRAPH : MAX_TEXT);

/** Collapses whitespace and cuts to `max` characters. */
export const clampText = (value: string, max: number): string => value.replace(/\s+/g, ' ').slice(0, Math.max(0, max));

/** How many more characters fit when `selected` of the current `length` are about to be replaced. */
export const roomLeft = (max: number, length: number, selected = 0): number => Math.max(0, max - (length - selected));
