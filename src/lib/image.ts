const MAX_BYTES = 15 * 1024 * 1024;

export type ImageResult = { ok: true; url: string } | { ok: false; error: string };

const load = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('decode'));
    img.src = src;
  });

/**
 * Reads a picked file and shrinks it so it fits in browser storage: longest side 1400 px,
 * JPEG for photos and WebP for everything else (keeps transparency).
 */
export async function fileToDataUrl(file: File, maxSide = 1400): Promise<ImageResult> {
  if (!file.type.startsWith('image/')) return { ok: false, error: 'Choose an image file (JPG, PNG, WebP or GIF).' };
  if (file.size > MAX_BYTES) return { ok: false, error: 'That image is over 15 MB. Choose a smaller one.' };
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await load(objectUrl);
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { ok: false, error: 'This browser could not process the image.' };
    const jpeg = file.type === 'image/jpeg';
    if (jpeg) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);
    return { ok: true, url: canvas.toDataURL(jpeg ? 'image/jpeg' : 'image/webp', 0.84) };
  } catch {
    return { ok: false, error: 'That file could not be read as an image.' };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
