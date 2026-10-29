import { useEffect, useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { Modal } from '@/components/common/Modal';
import { downloadBlob, shareOnWhatsApp } from '@/lib/screenshot';
import { useUiStore } from '@/store/ui';

type Props = { url: string; blob: Blob; brand: string };

/** The finished screenshot, with download and WhatsApp share. */
export function ShotModal({ url, blob, brand }: Props) {
  const close = useUiStore((s) => s.closeModal);
  const [note, setNote] = useState('');

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  const share = async () => {
    const message = `Here is my ${brand} store, made with Devduo ESaas.`;
    const result = await shareOnWhatsApp(blob, message);
    if (result === 'redirected') setNote('WhatsApp opened in a new tab and the image was downloaded. Attach it to the chat.');
    if (result === 'shared') setNote('Shared.');
  };

  return (
    <Modal title="Screenshot ready" onClose={close} wide>
      <h2>Your screenshot is ready</h2>
      <p>The whole site, with a Devduo ESaas watermark.</p>
      <div className="shot-frame" tabIndex={0} role="region" aria-label="Screenshot preview">
        <img src={url} alt={`Screenshot of the ${brand} storefront`} />
      </div>
      <div className="shot-actions">
        <button type="button" className="btn ghost" onClick={() => downloadBlob(blob)}>
          <Icon name="download" size={18} /> Download
        </button>
        <button type="button" className="btn" data-testid="share-whatsapp" data-autofocus onClick={share}>
          <Icon name="share" size={18} /> Share on WhatsApp
        </button>
      </div>
      {note && (
        <p className="hint" role="status">
          {note}
        </p>
      )}
    </Modal>
  );
}
