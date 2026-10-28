import { useState } from 'react';
import { fmtWeekday, hash } from '@/lib/format';
import type { Product } from '@/lib/types';
import { Art } from '@/components/common/Art';
import { Stars } from '@/components/common/bits';

export function Gallery({ product: p, view, onView }: { product: Product; view: number; onView: (i: number) => void }) {
  return (
    <div>
      <div className="gmain">
        <Art id={p.id} emoji={p.emoji} name={p.name} image={p.image} view={view} sizes="(max-width: 860px) 100vw, 560px" priority />
      </div>
      <div className="thumbs" role="group" aria-label="Product views">
        {[0, 1, 2, 3].map((i) => (
          <button key={i} type="button" className={`thumb${view === i ? ' on' : ''}`} aria-label={`View ${i + 1}`} aria-pressed={view === i} onClick={() => onView(i)}>
            <Art id={p.id} emoji={p.emoji} name="" image={p.image} view={i} sizes="120px" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function OptionPicker({ opts, value, onChange }: { opts: NonNullable<Product['opts']>; value: number; onChange: (i: number) => void }) {
  return (
    <div className="optrow" role="group" aria-label={opts.label}>
      <span className="optlabel">{opts.label}</span>
      <div className="chips">
        {opts.values.map((v, i) => (
          <button key={v} type="button" className={`chip${value === i ? ' on' : ''}`} aria-pressed={value === i} onClick={() => onChange(i)}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Six digits in, a delivery date or a fix-it message out. */
export function PincodeCheck() {
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const check = () => {
    if (!/^\d{6}$/.test(pin)) return setMsg({ ok: false, text: 'Enter a valid 6-digit pincode.' });
    setMsg({ ok: true, text: `Delivery available. Get it by ${fmtWeekday(Date.now() + 4 * 864e5)}.` });
  };
  return (
    <div>
      <div className="pin">
        <input
          value={pin}
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter pincode"
          aria-label="Delivery pincode"
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ''));
            setMsg(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && check()}
        />
        <button type="button" className="btn ghost" onClick={check}>
          Check
        </button>
      </div>
      {msg && (
        <p className={`pm ${msg.ok ? 'ok' : 'bad'}`} role="status">
          {msg.text}
        </p>
      )}
    </div>
  );
}

const NAMES = ['Anjali R', 'Karthik M', 'Divya S', 'Imran K', 'Meena P', 'Suresh V', 'Lakshmi N', 'Arjun T'];
const TEXTS = [
  'Exactly as described and packed with care.',
  'Quality is better than I expected for the price.',
  'Delivery was quick and I will order again.',
  'Gifted this to family and they loved it.',
  'Good value for money.',
  'Using it for two weeks and very happy.',
];

export function ReviewList({ id }: { id: string }) {
  const h = hash(id);
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div className="rvi" key={i}>
          <Stars rating={i === 2 ? 4 : 5} /> <b>{NAMES[(h + i * 3) % 8]}</b> <small>Verified buyer</small>
          <p>{TEXTS[(h + i * 5) % 6]}</p>
        </div>
      ))}
    </>
  );
}

type TabKey = 'desc' | 'det' | 'rev';

export function Tabs({ product: p }: { product: Product }) {
  const [tab, setTab] = useState<TabKey>('desc');
  const det = (p.d ?? '').split('|').filter(Boolean);
  const tabs: [TabKey, string][] = [
    ['desc', 'Description'],
    ['det', 'Details'],
    ['rev', 'Reviews'],
  ];
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Product information">
        {tabs.map(([k, label]) => (
          <button key={k} id={`tab-${k}`} type="button" role="tab" aria-selected={tab === k} aria-controls="tabpanel" className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>
      <div className="tc" id="tabpanel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'desc' && <p>{p.desc}</p>}
        {tab === 'det' && (
          <ul>
            {(det.length ? det : ['Made in India', 'Ships within 24 hours']).map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
        {tab === 'rev' && <ReviewList id={p.id} />}
      </div>
    </>
  );
}
