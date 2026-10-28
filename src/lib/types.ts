export const FONT_NAMES = [
  'Inter',
  'Poppins',
  'Playfair Display',
  'Lora',
  'Space Grotesk',
  'Manrope',
  'Nunito',
  'Fraunces',
] as const;
export type FontName = (typeof FONT_NAMES)[number];
export type Radius = 'sharp' | 'soft' | 'round';
export type Mode = 'light' | 'dark';

export type ThemeState = { primary: string; font: FontName; mode: Mode; radius: Radius };

export type ImageSrc = string;

export type ProductOptions = { label: string; values: string[]; mult?: number[] };

export type Product = {
  id: string; // globally unique, prefixed per template
  cat: string;
  name: string;
  price: number;
  mrp: number;
  image?: ImageSrc;
  emoji: string;
  rating: number;
  rev: number;
  desc: string;
  tag?: string;
  d?: string; // pipe-separated detail bullets
  opts?: ProductOptions;
};

export type Category = { slug: string; name: string; emoji: string; blurb: string; image?: ImageSrc };
export type Review = { q: string; n: string; c: string };

export type IconName = 'truck' | 'shield' | 'refresh' | 'chat' | 'leaf' | 'bolt' | 'star' | 'card' | 'headset' | 'box' | 'tag' | 'sparkle';
export type UspItem = { icon: IconName; title: string; text: string };

/* ---------- home sections ---------- */
type Cta = { cta: string; go: string };

export type Section =
  | ({ type: 'heroImage'; eyebrow: string; title: string; text: string; image: ImageSrc; badges: string[] } & Cta)
  | ({
      type: 'heroShowcase';
      eyebrow: string;
      title: string;
      text: string;
      cta2: string;
      go2: string;
      features: UspItem[];
      spotlight: { productId: string; label: string; tagline: string; cta: string };
    } & Cta)
  | ({ type: 'heroEditorial'; eyebrow: string; title: string; text: string; features: UspItem[]; art: string[]; script: string[] } & Cta)
  | ({
      type: 'heroDeals';
      badge: string;
      eyebrow: string;
      title: string;
      text: string;
      cta2: string;
      go2: string;
      image: ImageSrc;
      features: UspItem[];
    } & Cta)
  | { type: 'heroPhoto'; title: string; image: ImageSrc }
  | { type: 'usp'; style: 'card' | 'strip'; items: UspItem[] }
  | { type: 'cats'; style: 'photoCircles' | 'tiles' | 'circles' | 'quick' | 'cards'; title: string; link?: string }
  | { type: 'featured'; title: string; sub?: string; count: number; cols: 2 | 4 | 6; link?: string; ids?: string[] }
  | { type: 'rail'; cat: string; title: string }
  | ({ type: 'feature'; eyebrow: string; title: string; checks: string[]; image: ImageSrc; sticker: string[] } & Cta)
  | { type: 'promos'; cols: 2 | 3; items: ({ title: string; text: string; image?: ImageSrc; emoji?: string } & Cta)[] }
  | ({ type: 'promoBenefits'; eyebrow: string; title: string; text: string; emoji: string; benefits: { title: string; text: string }[] } & Cta)
  | { type: 'flash'; productId: string; title: string; label: string; image: ImageSrc; cta: string; endsInHours: number }
  | { type: 'testimonial'; quote: string; name: string; role: string; image?: ImageSrc }
  | { type: 'values'; items: string[] }
  | ({ type: 'bannerImage'; image: ImageSrc } & Cta)
  | { type: 'intro'; title: string; sub: string }
  | ({ type: 'spotlight'; badge: string; code: string; name: string; text: string; image: ImageSrc; cta2: string; sideImage: ImageSrc } & Cta)
  | { type: 'splitBand'; title: string; text: string; image: ImageSrc }
  | ({ type: 'duoFeature'; badge: string; code: string; name: string; text: string; image: ImageSrc; image2: ImageSrc } & Cta)
  | { type: 'news'; title: string; text: string };

export type SectionType = Section['type'];

export type Template = {
  id: string;
  name: string;
  logo: string;
  tag: string;
  foot: string;
  announce: string;
  theme: { primary: string; font: FontName; bg: string; mode: Mode; radius: Radius };
  cats: Category[];
  products: Product[];
  reviews: Review[];
  home: Section[];
};

/* ---------- commerce ---------- */
export type CartLine = { id: string; o: number; qty: number };
export type Coupon = 'WELCOME10' | 'FREESHIP';
export type ShipSpeed = 'std' | 'exp';
export type PayMethod = 'upi' | 'card' | 'cod';

export type Totals = {
  sub: number;
  mrp: number;
  save: number;
  disc: number;
  ship: number;
  cod: number;
  total: number;
};

export type User = { name: string; phone: string };

export type Address = { name: string; phone: string; addr: string; city: string; pin: string; state: string };

export type OrderItem = { id: string; name: string; emoji: string; opt: string; qty: number; price: number };
export type Order = {
  id: string;
  tpl: string;
  date: number;
  items: OrderItem[];
  t: Totals;
  addr: Address;
  pay: PayMethod;
  ship: ShipSpeed;
  stage: number;
  cancelled: boolean;
};

export type CheckoutForm = Address & { ship: ShipSpeed; pay: PayMethod; upi: string; card: string; exp: string; cvv: string };
