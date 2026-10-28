import type { ImgHTMLAttributes } from 'react';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  src: string;
  alt: string;
  /** Fill the positioned parent (the parent must be position: relative). */
  fill?: boolean;
  /** Above-the-fold image: load eagerly with high priority. */
  priority?: boolean;
  /** Accepted for API parity with responsive image components; the browser picks from the file itself. */
  sizes?: string;
};

export default function Img({ src, alt, fill, priority, sizes: _sizes, className = '', ...rest }: Props) {
  return (
    <img
      src={src}
      alt={alt}
      className={`${fill ? 'img-fill ' : ''}${className}`.trim()}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...(priority ? { fetchPriority: 'high' as const } : {})}
      {...rest}
    />
  );
}
