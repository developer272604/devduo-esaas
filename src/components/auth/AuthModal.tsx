import { useState } from 'react';
import { adapters, DEMO_OTP } from '@/lib/adapters';
import { PHONE_RE } from '@/lib/validation';
import { useAuthStore } from '@/store/auth';
import { useCheckoutStore } from '@/store/checkout';
import { useUiStore } from '@/store/ui';
import { Modal } from '@/components/common/Modal';

/** Phone and OTP sign-in. A modal only, never a page. */
export function AuthModal() {
  const close = useUiStore((s) => s.closeModal);
  const signIn = useAuthStore((s) => s.signIn);
  const form = useCheckoutStore((s) => s.form);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [name, setName] = useState(form.name);
  const [phone, setPhone] = useState(form.phone);
  const [otp, setOtp] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (name.trim().length < 2) return setErr('Enter your name.');
    if (!PHONE_RE.test(phone)) return setErr('Enter a 10-digit mobile number starting with 6, 7, 8 or 9.');
    setBusy(true);
    const r = await adapters.auth.sendOtp(phone);
    setBusy(false);
    if (!r.ok) return setErr(r.error ?? 'We could not send the OTP. Try again.');
    setErr('');
    setStep('otp');
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(otp)) return setErr('Enter the 6-digit OTP.');
    setBusy(true);
    const r = await adapters.auth.verifyOtp({ name, phone, otp });
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    signIn(r.user);
    const resume = useUiStore.getState().afterAuth;
    useUiStore.setState({ modal: null, afterAuth: null });
    useUiStore.getState().showToast(`Signed in as ${r.user.name}`);
    resume?.();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!busy) void (step === 'phone' ? send() : verify());
  };

  return (
    <Modal title="Sign in" onClose={close}>
      <form onSubmit={submit} noValidate>
        <h2>{step === 'phone' ? 'Sign in' : 'Enter OTP'}</h2>
        <p>
          {step === 'phone'
            ? 'We will send a one-time password to your mobile number.'
            : `Sent to +91 ${phone}. Demo OTP is ${DEMO_OTP}.`}
        </p>
        <div className="f one">
          {step === 'phone' ? (
            <>
              <div>
                <label htmlFor="auth-name">Name</label>
                <input id="auth-name" data-autofocus value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </div>
              <div>
                <label htmlFor="auth-phone">Mobile number</label>
                <input id="auth-phone" value={phone} maxLength={10} inputMode="numeric" autoComplete="tel-national" onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="auth-otp">6-digit OTP</label>
              <input id="auth-otp" data-autofocus value={otp} maxLength={6} inputMode="numeric" autoComplete="one-time-code" onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
            </div>
          )}
        </div>
        {err && (
          <div className="er" role="alert">
            {err}
          </div>
        )}
        <button type="submit" className="btn block" disabled={busy}>
          {step === 'phone' ? 'Send OTP' : 'Verify and sign in'}
        </button>
        {step === 'otp' && (
          <button
            type="button"
            className="btn ghost block"
            onClick={() => {
              setStep('phone');
              setErr('');
            }}
          >
            Change number
          </button>
        )}
      </form>
    </Modal>
  );
}
