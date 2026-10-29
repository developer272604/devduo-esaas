import Image from '@/components/common/Img';
import type { CSSProperties } from 'react';
import { hash } from '@/lib/format';
import { useCatalog } from '@/lib/hooks';
import type { ArtKind, ImageSrc } from '@/lib/types';
import { ImageControls, useSlotImage } from '@/components/demo/SlotImg';
import { useEditMode } from '@/components/demo/useEditMode';
import { Illustration } from './Illustration';

type Props = {
  id: string;
  /** Kept for old callers and for text fallbacks; pictures are drawn from `kind`. */
  emoji?: string;
  name: string;
  image?: ImageSrc;
  /** What to draw when there is no photo. Looked up from the product when not given. */
  kind?: ArtKind;
  /** Gallery view 0 to 3. */
  view?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Show the change-image controls while edit mode is on (home page cards only). */
  editable?: boolean;
};

/** The slot a product's picture is saved under. A replacement shows everywhere the product does. */
export const productSlot = (id: string) => `product.${id}`;

/**
 * Product picture. With a photo it renders an <img>; without one it draws an illustration of
 * the product on a tinted background. Tint and drawing follow --ph (the primary hue), so they
 * change live when the colour changes.
 */
export function Art({ id, name, image, kind, view = 0, sizes = '(max-width: 700px) 50vw, 25vw', priority, className = '', editable }: Props) {
  const custom = useSlotImage(productSlot(id));
  const editing = useEditMode() && !!editable;
  const { product } = useCatalog();
  const drawn: ArtKind = kind ?? product(id)?.art ?? 'box';
  const src = custom ?? image;
  const h = hash(id);
  // Drawn art keeps close to the brand hue; photos' backdrops can vary a little more.
  const style = { '--dh': src ? (h % 5) * 16 - 32 + view * 10 : (h % 5) * 9 - 18 + view * 5 } as CSSProperties;
  const controls = editing && <ImageControls slot={productSlot(id)} />;

  if (src) {
    return (
      <div className={`art art-img v${view} ${className}`} style={style}>
        <Image src={src} alt={name} fill sizes={sizes} priority={priority} className="art-photo" />
        {controls}
      </div>
    );
  }
  return (
    <div className={`art art-drawn v${view} ${className}`} style={style}>
      {/* a named picture for screen readers, or hidden when it only decorates a button that has its own name */}
      <span className="art-draw" {...(name ? { role: 'img', 'aria-label': name } : { 'aria-hidden': true })}>
        <i className="blob b1" />
        <i className="blob b2" />
        {view === 1 ? (
          <span className="row">
            {[0, 1, 2].map((i) => (
              <Illustration key={i} kind={drawn} variant={h + i} />
            ))}
          </span>
        ) : (
          <Illustration kind={drawn} variant={h + view} />
        )}
        {view === 3 && <span className="pack">{name}</span>}
      </span>
      {controls}
    </div>
  );
}

/** Tinted block with a drawn picture (or, with none, an emoji), for categories without a photo. */
export function CategoryTile({ id, emoji, art, className = '' }: { id: string; emoji: string; art?: ArtKind; className?: string }) {
  const style = { '--dh': (hash(id) % 5) * 16 - 32 } as CSSProperties;
  return (
    <span className={`emoji-tile ${className}`} style={style} aria-hidden="true">
      {art ? <Illustration kind={art} variant={hash(id)} /> : emoji}
    </span>
  );
}
