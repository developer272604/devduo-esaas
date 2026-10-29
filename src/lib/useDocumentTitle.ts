import { useEffect } from 'react';
import { useTemplate } from '@/store/template';
import { useText } from '@/components/demo/Txt';

/** The browser title for a page: "Cart (2) – Ooty Herbals · Devduo ESaas demo". With no page name it is the home title. */
export const composeTitle = (page: string | undefined, brand: string): string =>
  page ? `${page} – ${brand} · Devduo ESaas demo` : `${brand} · Devduo ESaas demo`;

export function useDocumentTitle(page?: string): void {
  const template = useTemplate();
  const brand = useText('brand.name', template.name);
  useEffect(() => {
    document.title = composeTitle(page, brand);
  }, [page, brand]);
}
