import type { ReactNode } from 'react';
import { useTemplate } from '@/store/template';
import { useCustomize } from '@/store/customize';

/** One persisted logo slot shared by the header, footer and settings preview. */
export function BrandLogo({ children }: { children: ReactNode }) {
  const template = useTemplate();
  const image = useCustomize((s) => s.images[template.id]?.['brand.logo']);
  return image ? <img className="custom-brand-logo" src={image} alt="" /> : <>{children}</>;
}
