import { toCanvas } from 'html-to-image';

export type Shot = { blob: Blob; url: string };

const MAX_CANVAS_SIDE = 15000;
const FILE_NAME = 'devduo-esaas-demo.png';

/** Anything marked data-no-capture (tools, dialogs, toast) stays out of the picture. */
const keep = (node: Node) => !(node instanceof HTMLElement && node.hasAttribute('data-no-capture'));

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

/** Faint diagonal text across the whole image, plus a solid badge in the bottom-right corner. */
export function stampWatermark(canvas: HTMLCanvasElement, label: string, scale: number): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  const family = 'system-ui, -apple-system, "Segoe UI", sans-serif';
  const tile = `${label} · Devduo ESaas demo`;

  ctx.save();
  ctx.rotate(-Math.PI / 9);
  ctx.font = `600 ${22 * scale}px ${family}`;
  ctx.textBaseline = 'middle';
  const stepX = 430 * scale;
  const stepY = 230 * scale;
  for (let y = -W; y < H + W; y += stepY) {
    for (let x = -H; x < W + H; x += stepX) {
      // a light copy and a dark copy, so the mark reads on any background
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fillText(tile, x + scale, y + scale);
      ctx.fillStyle = 'rgba(0,0,0,0.13)';
      ctx.fillText(tile, x, y);
    }
  }
  ctx.restore();

  const text = `${label}  ·  Made with Devduo ESaas`;
  ctx.font = `600 ${15 * scale}px ${family}`;
  const padX = 14 * scale;
  const boxH = 36 * scale;
  const boxW = ctx.measureText(text).width + padX * 2;
  const x = W - boxW - 16 * scale;
  const y = H - boxH - 16 * scale;
  ctx.fillStyle = 'rgba(0,0,0,0.78)';
  roundRect(ctx, x, y, boxW, boxH, 10 * scale);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, y + boxH / 2 + scale);
}

/** Renders the whole page (not just what is on screen) to a watermarked PNG. */
export async function captureSite(label: string): Promise<Shot> {
  await document.fonts?.ready;
  const root = document.body;
  const width = Math.max(root.scrollWidth, document.documentElement.clientWidth);
  const height = root.scrollHeight;
  const scale = Math.max(0.5, Math.min(2, window.devicePixelRatio || 1, MAX_CANVAS_SIDE / height));
  const background = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || 'white';

  document.documentElement.classList.add('capturing');
  try {
    const canvas = await toCanvas(root, { width, height, pixelRatio: scale, backgroundColor: background, filter: keep, cacheBust: false });
    stampWatermark(canvas, label, scale);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), 'image/png'));
    return { blob, url: URL.createObjectURL(blob) };
  } finally {
    document.documentElement.classList.remove('capturing');
  }
}

export function downloadBlob(blob: Blob, name = FILE_NAME): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export type ShareResult = 'shared' | 'redirected' | 'cancelled';

/**
 * Phones: the system share sheet with the image attached (pick WhatsApp).
 * Computers cannot attach an image through a link, so the image downloads and WhatsApp opens
 * with the message ready. The shopper attaches the downloaded file.
 */
export function shareOnWhatsApp(blob: Blob, text: string): Promise<ShareResult> {
  const file = new File([blob], FILE_NAME, { type: 'image/png' });
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    return navigator
      .share({ files: [file], text })
      .then((): ShareResult => 'shared')
      .catch((e: unknown): ShareResult => {
        if ((e as Error).name === 'AbortError') return 'cancelled';
        return openWhatsApp(blob, text);
      });
  }
  return Promise.resolve(openWhatsApp(blob, text));
}

function openWhatsApp(blob: Blob, text: string): ShareResult {
  downloadBlob(blob);
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  return 'redirected';
}
