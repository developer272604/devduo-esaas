import { useEffect, useId, useState, type FormEvent } from 'react';
import { inr } from '@/lib/format';
import { clampRange, parsePrice, type Bounds } from './model';

type Props = {
  bounds: Bounds;
  /** The range that is applied to the list right now. */
  value: { min: number; max: number };
  onApply: (min: number, max: number) => void;
};

/**
 * Two-thumb slider with a number box for each end and an Apply button.
 * Dragging or typing only changes the draft; the list changes when Apply is pressed (or Enter).
 */
export function PriceRange({ bounds, value, onApply }: Props) {
  const id = useId();
  const [draft, setDraft] = useState({ min: String(value.min), max: String(value.max) });
  useEffect(() => setDraft({ min: String(value.min), max: String(value.max) }), [value.min, value.max]);

  const { lo, hi, step } = bounds;
  const span = Math.max(1, hi - lo);
  const dMin = Math.min(hi, Math.max(lo, parsePrice(draft.min, lo)));
  const dMax = Math.min(hi, Math.max(lo, parsePrice(draft.max, hi)));
  const left = ((Math.min(dMin, dMax) - lo) / span) * 100;
  const right = ((Math.max(dMin, dMax) - lo) / span) * 100;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = clampRange(draft.min, draft.max, bounds);
    setDraft({ min: String(r.min), max: String(r.max) });
    onApply(r.min, r.max);
  };

  return (
    <form className="pr" onSubmit={submit} aria-label="Price range">
      <p className="pr-now" aria-hidden="true">
        {inr(Math.min(dMin, dMax))} to {inr(Math.max(dMin, dMax))}
      </p>
      <div className="pr-slider">
        <div className="pr-track" aria-hidden="true">
          <span className="pr-fill" style={{ left: `${left}%`, right: `${100 - right}%` }} />
        </div>
        <input
          type="range"
          aria-label="Minimum price slider"
          min={lo}
          max={hi}
          step={step}
          value={dMin}
          // when both thumbs sit at the top end, the lower one must stay reachable
          className={dMin >= hi - step ? 'top' : undefined}
          onChange={(e) => setDraft((d) => ({ ...d, min: String(Math.min(Number(e.target.value), dMax)) }))}
        />
        <input
          type="range"
          aria-label="Maximum price slider"
          min={lo}
          max={hi}
          step={step}
          value={dMax}
          onChange={(e) => setDraft((d) => ({ ...d, max: String(Math.max(Number(e.target.value), dMin)) }))}
        />
      </div>
      <div className="pr-boxes">
        <label htmlFor={`${id}-min`}>
          <span>Min (₹)</span>
          <input id={`${id}-min`} type="number" inputMode="numeric" min={lo} max={hi} step={step} value={draft.min} onChange={(e) => setDraft((d) => ({ ...d, min: e.target.value }))} />
        </label>
        <span className="pr-dash" aria-hidden="true">
          –
        </span>
        <label htmlFor={`${id}-max`}>
          <span>Max (₹)</span>
          <input id={`${id}-max`} type="number" inputMode="numeric" min={lo} max={hi} step={step} value={draft.max} onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value }))} />
        </label>
        <button type="submit" className="btn sm">
          Apply
        </button>
      </div>
    </form>
  );
}
