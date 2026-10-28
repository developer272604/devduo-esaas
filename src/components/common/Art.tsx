import Image from '@/components/common/Img';
import type { CSSProperties } from 'react';
import { hash } from '@/lib/format';
import type { ImageSrc } from '@/lib/types';

type Props = {
  id: string;
  emoji: string;
  name: string;
  image?: ImageSrc;
  /** Gallery view 0 to 3. */
  view?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Product picture. With an image it renders an <img>; without one it falls back
 * to a tinted gradient and an emoji. The tint follows --ph (the primary hue), so it
 * changes live when the colour changes.
 */
export function Art({ id, emoji, name, image, view = 0, sizes = '(max-width: 700px) 50vw, 25vw', priority, className = '' }: Props) {
  const style = { '--dh': (hash(id) % 5) * 16 - 32 + view * 10 } as CSSProperties;
  if (image) {
    return (
      <div className={`art art-img v${view} ${className}`} style={style}>
        <Image src={image} alt={name} fill sizes={sizes} priority={priority} className="art-photo" />
      </div>
    );
  }
  return (
    <div className={`art ${className}`} style={style} role="img" aria-label={name}>
      <i className="blob b1" />
      <i className="blob b2" />
      {view === 1 ? (
        <div className="row">
          <span className="em sm">{emoji}</span>
          <span className="em sm">{emoji}</span>
          <span className="em sm">{emoji}</span>
        </div>
      ) : view === 2 ? (
        <span className="em xl">{emoji}</span>
      ) : view === 3 ? (
        <>
          <span className="em">{emoji}</span>
          <span className="pack">{name}</span>
        </>
      ) : (
        <span className="em">{emoji}</span>
      )}
    </div>
  );
}

/** Tinted block with an emoji, for categories and banners that have no photo. */
export function EmojiTile({ emoji, id, className = '' }: { emoji: string; id: string; className?: string }) {
  const style = { '--dh': (hash(id) % 5) * 16 - 32 } as CSSProperties;
  return (
    <span className={`emoji-tile ${className}`} style={style} aria-hidden="true">
      {emoji}
    </span>
  );
}
