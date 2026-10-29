import { useEffect, useRef, useState } from 'react';
import { useFocusTrap } from '@/lib/useFocusTrap';
import { useDemoStore, useTourOpen } from '@/store/demo';

type Step = { title: string; text: string; target: string | null; fallback?: string };

const STEPS: Step[] = [
  {
    title: 'Welcome to the demo store',
    text: 'In about a minute you can make this store look like your own brand. The next steps show how.',
    target: null,
  },
  {
    title: 'Pick a template, colour and font',
    text: 'Open Settings on the right edge. Choose a template, then a colour, font, light or dark mode and corner style. The whole store changes at once.',
    target: '.stab',
  },
  {
    title: 'Change any text or image',
    text: 'On the home page, press Edit in the bar below. Click any text to type over it, and click any image to swap in your own. Changes stay after a refresh, and a small × puts the original back. Other pages show your changes but are not editable.',
    target: '[data-tour="edit"]',
    fallback: '[data-tour="bar"]',
  },
  {
    title: 'Show it full screen and share it',
    text: 'Full screen hides the tools so the site fills your screen. Screenshot saves the whole site with a watermark, and you can share it on WhatsApp.',
    target: '[data-tour="bar"]',
  },
];

type Box = { top: number; left: number; width: number; height: number };

const PAD = 8;

function useTargetBox(selector: string | null, fallback?: string): Box | null {
  const [box, setBox] = useState<Box | null>(null);
  useEffect(() => {
    if (!selector) return setBox(null);
    const measure = () => {
      // The first target that is actually on screen; on a phone the tools hide inside a menu.
      const found = [selector, fallback].flatMap((q) => (q ? [document.querySelector(q)] : [])).find((el) => el && el.getBoundingClientRect().width > 0);
      if (!found) return setBox(null);
      const r = found.getBoundingClientRect();
      setBox({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
    };
    measure();
    const t = setInterval(measure, 300); // catches layout shifts as images and fonts load
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearInterval(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [selector, fallback]);
  return box;
}

/** First-visit walkthrough. Skip ends it for good; Settings can reopen it. */
export function Tour() {
  const open = useTourOpen();
  const endTour = useDemoStore((s) => s.endTour);
  const snooze = useDemoStore((s) => s.snooze);
  const cardRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const next = useRef<HTMLButtonElement>(null);
  const current = STEPS[step];
  const box = useTargetBox(open ? current.target : null, current.fallback);
  const last = step === STEPS.length - 1;

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  // Tab stays inside the card, Escape hides it for now, and focus goes back to where it was.
  useFocusTrap(cardRef, open, snooze);

  if (!open) return null;

  return (
    <>
      {box ? <div className="tour-ring" style={box} aria-hidden="true" data-no-capture /> : <div className="tour-dim" aria-hidden="true" data-no-capture />}
      <section ref={cardRef} className={`tour-card${box ? '' : ' center'}`} role="dialog" aria-modal="true" aria-label="Quick tour" tabIndex={-1} data-no-capture data-tour-card>
        <p className="tour-step">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2>{current.title}</h2>
        <p>{current.text}</p>
        <div className="tour-actions">
          <button type="button" className="btn ghost sm" onClick={endTour}>
            Skip tour
          </button>
          <span className="sp" />
          {step > 0 && (
            <button type="button" className="btn ghost sm" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <button type="button" className="btn sm" ref={next} data-autofocus onClick={() => (last ? endTour() : setStep(step + 1))}>
            {last ? 'Got it' : step === 0 ? 'Show me' : 'Next'}
          </button>
        </div>
      </section>
    </>
  );
}
