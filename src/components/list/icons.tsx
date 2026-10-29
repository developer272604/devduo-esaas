import type { ReactNode } from 'react';

/** Small line icons only the list page uses. Same drawing rules as common/Icon. */
function Svg({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export const SlidersIcon = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Svg>
);

export const GridIcon = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
  </Svg>
);

export const ListIcon = ({ size }: { size?: number }) => (
  <Svg size={size}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.8" cy="6" r="0.6" />
    <circle cx="4.8" cy="12" r="0.6" />
    <circle cx="4.8" cy="18" r="0.6" />
  </Svg>
);
