import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** `router.push(href)` for components, backed by React Router. */
export function useRouter() {
  const navigate = useNavigate();
  const push = useCallback((href: string) => navigate(href), [navigate]);
  return useMemo(() => ({ push }), [push]);
}

export const usePathname = (): string => useLocation().pathname;
