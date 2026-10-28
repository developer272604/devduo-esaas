import { usePathname } from '@/lib/nav';
import { useCustomize } from '@/store/customize';

/** Text and image editing happen on the home page only. Everywhere else the site shows the saved result. */
export const HOME_PATH = '/';

export function useEditMode(): boolean {
  const editing = useCustomize((s) => s.editing);
  return editing && usePathname() === HOME_PATH;
}
