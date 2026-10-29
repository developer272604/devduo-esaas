import type { ReactNode } from 'react';
import type { ArtKind } from '@/lib/types';

/**
 * Flat product illustrations, drawn in code. They stand in for a photo when a product has none.
 * Every colour comes from the theme through the --ill-* variables (see common.css), so they
 * follow the chosen colour and light or dark mode. `variant` (0 to 2) varies small details so
 * products of the same kind do not look identical.
 */

const Shadow = ({ rx = 56 }: { rx?: number }) => <ellipse className="ill-shadow" cx="100" cy="178" rx={rx} ry="6.5" />;

const SHAPES: Record<ArtKind, (v: number) => ReactNode> = {
  phone: (v) => (
    <>
      <Shadow rx={42} />
      <rect className="ill-body" x="62" y="24" width="76" height="152" rx="15" />
      <rect className="ill-light" x="68" y="32" width="64" height="136" rx="10" />
      <rect className="ill-body" x="88" y="37" width="24" height="6" rx="3" />
      {[0, 1, 2].flatMap((r) =>
        [0, 1, 2].map((c) => <rect key={`${r}${c}`} className={(r + c + v) % 3 === 0 ? 'ill-accent' : 'ill-mid'} x={75 + c * 19} y={58 + r * 22} width="14" height="14" rx="4.5" />),
      )}
      <rect className="ill-mid" x="76" y="140" width="48" height="9" rx="4.5" />
    </>
  ),
  tablet: (v) => (
    <>
      <Shadow rx={64} />
      <rect className="ill-body" x="34" y="40" width="132" height="118" rx="15" />
      <rect className="ill-light" x="42" y="48" width="116" height="102" rx="9" />
      <circle className="ill-mid" cx="100" cy="44" r="1.8" />
      <rect className={v === 1 ? 'ill-mid' : 'ill-accent'} x="52" y="58" width="52" height="34" rx="6" />
      <rect className="ill-mid" x="110" y="58" width="38" height="8" rx="4" />
      <rect className="ill-mid" x="110" y="72" width="30" height="8" rx="4" />
      <rect className="ill-mid" x="52" y="102" width="96" height="8" rx="4" />
      <rect className="ill-mid" x="52" y="118" width="70" height="8" rx="4" />
    </>
  ),
  earbuds: () => (
    <>
      <Shadow rx={52} />
      <rect className="ill-body" x="48" y="100" width="104" height="58" rx="26" />
      <path className="ill-line" d="M48 126 H152" />
      <circle className="ill-accent" cx="100" cy="143" r="3.5" />
      <ellipse className="ill-mid" cx="76" cy="62" rx="15" ry="17" />
      <rect className="ill-light" x="82" y="66" width="9" height="32" rx="4.5" />
      <ellipse className="ill-mid" cx="124" cy="62" rx="15" ry="17" />
      <rect className="ill-light" x="109" y="66" width="9" height="32" rx="4.5" />
      <circle className="ill-accent" cx="72" cy="58" r="4" />
      <circle className="ill-accent" cx="128" cy="58" r="4" />
    </>
  ),
  neckband: () => (
    <>
      <Shadow rx={50} />
      <path className="ill-stroke" d="M52 52 C48 156 152 156 148 52" style={{ strokeWidth: 12 }} />
      <ellipse className="ill-accent" cx="52" cy="50" rx="13" ry="16" />
      <ellipse className="ill-accent" cx="148" cy="50" rx="13" ry="16" />
      <rect className="ill-mid" x="82" y="137" width="36" height="17" rx="8.5" />
      <circle className="ill-light" cx="100" cy="145.5" r="3" />
    </>
  ),
  watch: (v) => (
    <>
      <Shadow rx={34} />
      <rect className="ill-mid" x="78" y="12" width="44" height="50" rx="11" />
      <rect className="ill-mid" x="78" y="138" width="44" height="50" rx="11" />
      <rect className="ill-body" x="56" y="50" width="88" height="100" rx="28" />
      <rect className="ill-light" x="65" y="59" width="70" height="82" rx="21" />
      <rect className="ill-mid" x="144" y="88" width="7" height="20" rx="3.5" />
      <path className="ill-stroke-ink" style={{ strokeWidth: 4 }} d={v === 1 ? 'M100 100 V76 M100 100 H122' : 'M100 100 V78 M100 100 L117 109'} />
      <circle className="ill-accent" cx="100" cy="100" r="5" />
    </>
  ),
  band: () => (
    <>
      <Shadow rx={28} />
      <rect className="ill-mid" x="86" y="12" width="28" height="176" rx="14" />
      <rect className="ill-body" x="76" y="58" width="48" height="84" rx="17" />
      <rect className="ill-light" x="82" y="64" width="36" height="72" rx="12" />
      <circle className="ill-accent" cx="100" cy="88" r="9" />
      <rect className="ill-mid" x="90" y="106" width="20" height="6" rx="3" />
      <rect className="ill-mid" x="92" y="118" width="16" height="6" rx="3" />
    </>
  ),
  charger: () => (
    <>
      <Shadow rx={44} />
      <path className="ill-stroke-mid" style={{ strokeWidth: 6 }} d="M100 144 C100 176 56 174 54 150" />
      <rect className="ill-mid" x="80" y="36" width="11" height="34" rx="3" />
      <rect className="ill-mid" x="109" y="36" width="11" height="34" rx="3" />
      <rect className="ill-body" x="60" y="66" width="80" height="80" rx="18" />
      <rect className="ill-light" x="82" y="106" width="36" height="14" rx="7" />
      <circle className="ill-accent" cx="100" cy="88" r="6" />
    </>
  ),
  powerbank: () => (
    <>
      <Shadow rx={64} />
      <rect className="ill-body" x="40" y="54" width="120" height="94" rx="22" />
      <rect className="ill-light" x="54" y="70" width="48" height="22" rx="7" />
      <path className="ill-stroke-ink" d="M62 81 H94" style={{ strokeWidth: 4 }} />
      <rect className="ill-mid" x="114" y="70" width="32" height="10" rx="5" />
      <rect className="ill-mid" x="114" y="86" width="32" height="10" rx="5" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} className={i < 3 ? 'ill-accent' : 'ill-mid'} cx={64 + i * 14} cy="120" r="4.5" />
      ))}
    </>
  ),
  kurti: (v) => (
    <>
      <Shadow rx={58} />
      <path className="ill-body" d="M72 22 L100 34 L128 22 L162 54 L144 76 L134 68 L142 172 L58 172 L66 68 L56 76 L38 54 Z" />
      <path className="ill-light" d="M86 24 L100 58 L114 24 Z" />
      <rect className="ill-mid" x="64" y="104" width="72" height="9" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} className="ill-accent" cx={72 + i * 11.2} cy="108.5" r="2.8" />
      ))}
      {[0, 1, 2].map((i) => (
        <circle key={i} className="ill-light" cx="100" cy={68 + i * 12} r="2.4" />
      ))}
      {v === 1 && <path className="ill-line" d="M62 150 H138" />}
      <path className="ill-accent" d="M58 160 H142 L142 172 H58 Z" />
    </>
  ),
  lehenga: () => (
    <>
      <Shadow rx={68} />
      <path className="ill-body" d="M78 20 L100 31 L122 20 L134 48 L122 62 H78 L66 48 Z" />
      <path className="ill-light" d="M88 22 L100 44 L112 22 Z" />
      <path className="ill-mid" d="M80 62 H120 L172 170 Q100 186 28 170 Z" />
      <rect className="ill-accent" x="78" y="59" width="44" height="7" rx="3.5" />
      <path className="ill-accent" d="M33 160 Q100 178 167 160 L172 170 Q100 187 28 170 Z" />
      <path className="ill-stroke-accent" d="M124 24 C158 58 150 112 130 150" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} className="ill-light" cx={64 + i * 24} cy={140 + (i % 2) * 6} r="3" />
      ))}
    </>
  ),
  suit: () => (
    <>
      <Shadow rx={52} />
      <path className="ill-mid" d="M66 124 H134 L130 176 H107 L100 148 L93 176 H70 Z" />
      <path className="ill-body" d="M72 20 L100 31 L128 20 L154 48 L138 68 L134 64 L138 134 L62 134 L66 64 L62 68 L46 48 Z" />
      <path className="ill-light" d="M87 22 L100 52 L113 22 Z" />
      <rect className="ill-accent" x="62" y="108" width="76" height="8" />
      <path className="ill-stroke-accent" d="M70 28 C38 76 44 124 60 160" />
    </>
  ),
  coord: () => (
    <>
      <Shadow rx={62} />
      <path className="ill-mid" d="M64 100 H136 L162 176 H112 L100 130 L88 176 H38 Z" />
      <path className="ill-body" d="M70 22 L100 32 L130 22 L150 48 L136 60 L134 90 H66 L64 60 L50 48 Z" />
      <rect className="ill-accent" x="64" y="94" width="72" height="9" rx="3" />
      <path className="ill-light" d="M88 24 Q100 42 112 24 Z" />
    </>
  ),
  trousers: () => (
    <>
      <Shadow rx={56} />
      <path className="ill-mid" d="M62 40 H138 L158 176 H108 L100 84 L92 176 H42 Z" />
      <rect className="ill-body" x="60" y="26" width="80" height="16" rx="5" />
      <path className="ill-line" d="M100 42 V84 M70 60 Q78 70 70 80 M130 60 Q122 70 130 80" />
      <circle className="ill-accent" cx="100" cy="34" r="3.2" />
    </>
  ),
  potli: () => (
    <>
      <Shadow rx={52} />
      <path className="ill-stroke-accent" d="M72 90 C66 44 134 44 128 90" style={{ strokeWidth: 5 }} />
      <path className="ill-body" d="M58 98 C44 142 60 174 100 174 C140 174 156 142 142 98 Z" />
      <path className="ill-mid" d="M58 98 Q100 74 142 98 L136 86 Q100 68 64 86 Z" />
      <circle className="ill-accent" cx="100" cy="136" r="14" />
      <circle className="ill-light" cx="100" cy="136" r="5.5" />
      <path className="ill-line" d="M70 150 Q100 166 130 150" />
    </>
  ),
  bottle: (v) => (
    <>
      <Shadow rx={34} />
      <rect className="ill-body" x="74" y="56" width="52" height="116" rx="17" />
      <rect className="ill-mid" x="89" y="38" width="22" height="22" rx="4" />
      <rect className="ill-ink" x="82" y="20" width="36" height="22" rx="7" />
      <rect className="ill-light" x="80" y="92" width="40" height="52" rx="9" />
      <path className="ill-stroke-body" d="M88 118 H112 M88 128 H112 M88 138 H102" style={{ strokeWidth: 3 }} />
      {v === 1 ? <rect className="ill-accent" x="88" y="100" width="24" height="9" rx="4.5" /> : <circle className="ill-accent" cx="100" cy="104" r="7" />}
    </>
  ),
  serum: () => (
    <>
      <Shadow rx={32} />
      <rect className="ill-body" x="70" y="84" width="60" height="88" rx="19" />
      <rect className="ill-mid" x="87" y="66" width="26" height="22" rx="5" />
      <path className="ill-ink" d="M91 68 V42 Q100 20 109 42 V68 Z" />
      <rect className="ill-light" x="78" y="108" width="44" height="38" rx="9" />
      <path className="ill-accent" d="M100 114 Q108 126 100 134 Q92 126 100 114 Z" />
    </>
  ),
  jar: (v) => (
    <>
      <Shadow rx={48} />
      <rect className="ill-mid" x="58" y="48" width="84" height="22" rx="8" />
      <path className="ill-body" d="M62 70 H138 V152 Q138 174 116 174 H84 Q62 174 62 152 Z" />
      <rect className="ill-light" x="70" y="98" width="60" height="46" rx="8" />
      {v === 2 ? <path className="ill-accent" d="M84 134 L100 106 L116 134 Z" /> : <circle className="ill-accent" cx="100" cy="121" r="12" />}
      <path className="ill-line" d="M66 84 V150" opacity=".5" />
    </>
  ),
  honey: () => (
    <>
      <Shadow rx={48} />
      <rect className="ill-body" x="62" y="40" width="76" height="26" rx="8" />
      <path className="ill-honey" d="M62 66 H138 V152 Q138 174 116 174 H84 Q62 174 62 152 Z" />
      <path className="ill-honey-shine" d="M72 78 V150" />
      <rect className="ill-light" x="72" y="96" width="56" height="48" rx="9" />
      <path className="ill-body" d="M100 106 L108 114 V126 L100 134 L92 126 V114 Z" />
      <circle className="ill-honey" cx="100" cy="120" r="4.5" />
    </>
  ),
  tube: () => (
    <>
      <Shadow rx={30} />
      <rect className="ill-mid" x="68" y="22" width="64" height="16" rx="3" />
      <path className="ill-body" d="M72 38 H128 L120 160 H80 Z" />
      <rect className="ill-light" x="78" y="76" width="44" height="46" rx="8" />
      <path className="ill-accent" d="M100 120 C86 104 94 88 110 84 C112 100 108 112 100 120 Z" />
      <rect className="ill-ink" x="80" y="160" width="40" height="18" rx="5" />
    </>
  ),
  teabox: () => (
    <>
      <Shadow rx={58} />
      <rect className="ill-body" x="46" y="76" width="108" height="88" rx="11" />
      <rect className="ill-mid" x="42" y="62" width="116" height="24" rx="9" />
      <rect className="ill-light" x="60" y="102" width="80" height="42" rx="8" />
      <path className="ill-accent" d="M100 140 C80 124 88 108 112 104 C114 122 110 134 100 140 Z" />
      <path className="ill-stroke-light" d="M164 34 V60" strokeWidth="2.5" />
      <rect className="ill-light" x="150" y="58" width="28" height="30" rx="4" />
      <rect className="ill-accent" x="160" y="26" width="10" height="9" rx="2" />
    </>
  ),
  pouch: (v) => (
    <>
      <Shadow rx={50} />
      <path className="ill-body" d="M58 38 H142 L150 162 Q150 174 138 174 H62 Q50 174 50 162 Z" />
      <rect className="ill-mid" x="58" y="38" width="84" height="13" rx="3" />
      <path className="ill-line" d="M60 64 H140" />
      <rect className="ill-light" x="66" y="88" width="68" height="58" rx="10" />
      <circle className="ill-accent" cx="100" cy={v === 1 ? 108 : 112} r="11" />
      <path className="ill-stroke-body" d="M82 134 H118" style={{ strokeWidth: 3 }} />
    </>
  ),
  giftbox: () => (
    <>
      <Shadow rx={60} />
      <rect className="ill-body" x="44" y="92" width="112" height="76" rx="9" />
      <rect className="ill-mid" x="38" y="70" width="124" height="28" rx="9" />
      <rect className="ill-accent" x="93" y="70" width="14" height="98" />
      <path className="ill-accent" d="M100 70 C66 30 54 66 100 70 Z" />
      <path className="ill-accent" d="M100 70 C134 30 146 66 100 70 Z" />
      <circle className="ill-light" cx="100" cy="70" r="6" />
    </>
  ),
  sack: () => (
    <>
      <Shadow rx={52} />
      <path className="ill-body" d="M62 54 H138 L148 164 Q148 174 138 174 H62 Q52 174 52 164 Z" />
      <path className="ill-mid" d="M62 54 Q100 14 138 54 Z" />
      <rect className="ill-accent" x="91" y="44" width="18" height="9" rx="3" />
      <rect className="ill-light" x="60" y="92" width="80" height="48" rx="9" />
      {[0, 1, 2].map((i) => (
        <ellipse key={i} className="ill-accent" cx={80 + i * 20} cy="116" rx="5" ry="10" transform={`rotate(${(i - 1) * 24} ${80 + i * 20} 116)`} />
      ))}
    </>
  ),
  mat: () => (
    <>
      <Shadow rx={56} />
      <circle className="ill-body" cx="100" cy="108" r="58" />
      <circle className="ill-mid" cx="100" cy="108" r="45" />
      <circle className="ill-body" cx="100" cy="108" r="32" />
      <circle className="ill-mid" cx="100" cy="108" r="19" />
      <circle className="ill-light" cx="100" cy="108" r="7" />
      <rect className="ill-accent" x="38" y="98" width="124" height="14" rx="7" opacity=".92" />
    </>
  ),
  plates: () => (
    <>
      <Shadow rx={68} />
      <ellipse className="ill-body" cx="100" cy="156" rx="68" ry="17" />
      <ellipse className="ill-light" cx="100" cy="153" rx="55" ry="12" />
      <ellipse className="ill-body" cx="100" cy="134" rx="58" ry="14" />
      <ellipse className="ill-light" cx="100" cy="131" rx="46" ry="10" />
      <path className="ill-mid" d="M66 78 H134 Q134 122 100 122 Q66 122 66 78 Z" />
      <ellipse className="ill-light" cx="100" cy="78" rx="34" ry="8" />
      <ellipse className="ill-accent" cx="100" cy="78" rx="34" ry="8" opacity=".45" />
      <path className="ill-stroke-accent" d="M72 150 Q100 160 128 150" style={{ strokeWidth: 3 }} />
    </>
  ),
  box: () => (
    <>
      <Shadow rx={56} />
      <rect className="ill-body" x="50" y="62" width="100" height="106" rx="8" />
      <path className="ill-mid" d="M50 62 L64 38 H136 L150 62 Z" />
      <rect className="ill-light" x="62" y="92" width="76" height="52" rx="9" />
      <circle className="ill-accent" cx="100" cy="112" r="11" />
      <path className="ill-stroke-body" d="M80 132 H120" style={{ strokeWidth: 3 }} />
    </>
  ),
  sachets: () => (
    <>
      <Shadow rx={60} />
      <rect className="ill-body" x="52" y="62" width="30" height="112" rx="6" />
      <rect className="ill-mid" x="85" y="40" width="30" height="134" rx="6" />
      <rect className="ill-accent" x="118" y="68" width="30" height="106" rx="6" />
      <rect className="ill-light" x="56" y="96" width="22" height="36" rx="4" />
      <rect className="ill-light" x="89" y="84" width="22" height="42" rx="4" />
      <rect className="ill-light" x="122" y="100" width="22" height="34" rx="4" />
      <path className="ill-line" d="M52 70 H82 M85 48 H115 M118 76 H148" />
    </>
  ),
  case: () => (
    <>
      <Shadow rx={64} />
      <path className="ill-stroke-mid" d="M78 72 V54 Q78 44 88 44 H112 Q122 44 122 54 V72" style={{ strokeWidth: 8 }} />
      <rect className="ill-body" x="42" y="70" width="116" height="90" rx="18" />
      <path className="ill-line" d="M42 108 H158" />
      <rect className="ill-accent" x="91" y="98" width="18" height="20" rx="5" />
      <circle className="ill-light" cx="100" cy="108" r="3" />
    </>
  ),
};

export function Illustration({ kind, variant = 0, className = '' }: { kind: ArtKind; variant?: number; className?: string }) {
  return (
    <svg className={`ill ${className}`.trim()} viewBox="0 0 200 200" role="presentation" aria-hidden="true" focusable="false">
      {(SHAPES[kind] ?? SHAPES.box)(variant % 3)}
    </svg>
  );
}

export const ART_KINDS = Object.keys(SHAPES) as ArtKind[];
