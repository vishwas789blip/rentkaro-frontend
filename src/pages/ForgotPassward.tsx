import React, { useState, useEffect } from 'react';
import { authAPI } from '@/services/api';
import LeftPanel from '@/components/LeftPanel';
import StepIndicator from '@/components/StepIndicator';
import OTPBoxes from '@/components/OTPBoxes';
import PasswordStrengthBar from '@/components/PasswordStrengthBar';
import PrimaryButton from '@/components/PrimaryButton';
import Alert from '@/components/Alert';
import { Input, InputWrapper, Label } from '@/components/FormInput';

import {
  isValidEmail,
  isValidOTP,
  maskEmail,
  getPasswordErrors,
  getRemainingSeconds,
  formatCountdown,
} from '@/lib/utils';

type Step = 'SEND_OTP' | 'VERIFY_OTP' | 'NEW_PASSWORD' | 'SUCCESS';

// ── Component ─────────────────────────────────────────────────
const ForgotPassword: React.FC = () => {
  const [step, setStep]             = useState<Step>('SEND_OTP');
  const [email, setEmail]           = useState('');
  const [otp, setOtp]               = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [showCpw, setShowCpw]       = useState(false);
  const [message, setMessage]       = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  // Timer
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const OTP_TTL = 120;

  useEffect(() => {
    if (!otpSentAt) return;
    const tick = setInterval(() => {
      const rem = getRemainingSeconds(otpSentAt, OTP_TTL);
      setCountdown(rem);
      if (rem === 0) clearInterval(tick);
    }, 1000);
    return () => clearInterval(tick);
  }, [otpSentAt]);

  const clear = () => { setMessage(''); setError(''); };

  // ── Step 1: Send OTP ──────────────────────────────────────
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault(); clear();
    if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setMessage('OTP sent! Check your inbox.');
      setOtpSentAt(Date.now());
      setCountdown(OTP_TTL);
      setStep('VERIFY_OTP');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault(); clear();
    if (!isValidOTP(otp)) { setError('Enter the complete 6-digit OTP.'); return; }
    setLoading(true);
    try {
      const res   = await authAPI.verifyResetOtp({ email, otp });
      const token = res.data?.data?.resetToken || res.data?.resetToken;
      if (!token) throw new Error('No reset token received from server.');
      setResetToken(token);
      setMessage('Identity confirmed.');
      setStep('NEW_PASSWORD');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault(); clear();
    const errs = getPasswordErrors(password);
    if (errs.length) { setError(errs[0]); return; }
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword({ resetToken, newPassword: password });
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────
  const handleResend = async () => {
    clear();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setOtp('');
      setOtpSentAt(Date.now());
      setCountdown(OTP_TTL);
      setMessage('A new OTP has been sent.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes rk-spin { to { transform: rotate(360deg); } }
        @keyframes rk-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .rk-step { animation: rk-fade 0.3s ease; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* ── Left branding panel ── */}
        <LeftPanel step={step} />

        {/* ── Right form panel ── */}
        <div style={{
          flex: 1, padding: '48px 52px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          background: '#fff', overflowY: 'auto',
        }}>
          {step !== 'SUCCESS' && <StepIndicator current={step} />}

          {message && <Alert type="success" message={message} />}
          {error   && <Alert type="error"   message={error}   />}

          {/* ── STEP 1: Email ── */}
          {step === 'SEND_OTP' && (
            <div className="rk-step">
              <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px', color: '#111827', fontFamily: 'Georgia, serif' }}>
                Password Recovery
              </h2>
              <p style={{ color: '#6B7280', marginBottom: 28, fontSize: 14, lineHeight: 1.6 }}>
                Enter your registered email and we'll send a one-time code.
              </p>
              <form onSubmit={handleSendOTP}>
                <InputWrapper>
                  <Label>Email Address</Label>
                  <Input
                    icon="✉"
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </InputWrapper>
                <PrimaryButton type="submit" loading={loading}>
                  Send OTP →
                </PrimaryButton>
              </form>
              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6B7280' }}>
                Remembered it?{' '}
                <a href="/login" style={{ color: '#1DB47F', fontWeight: 600, textDecoration: 'none' }}>
                  Back to Log In
                </a>
              </p>
            </div>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 'VERIFY_OTP' && (
            <div className="rk-step">
              <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px', color: '#111827', fontFamily: 'Georgia, serif' }}>
                Enter your OTP
              </h2>
              <p style={{ color: '#6B7280', marginBottom: 28, fontSize: 14, lineHeight: 1.6 }}>
                We sent a 6-digit code to{' '}
                <strong style={{ color: '#111827' }}>{maskEmail(email)}</strong>.
                {countdown > 0 && (
                  <> Expires in <strong style={{ color: '#EF4444' }}>{formatCountdown(countdown)}</strong>.</>
                )}
              </p>
              <form onSubmit={handleVerifyOTP}>
                <InputWrapper>
                  <Label>One-Time Password</Label>
                  <OTPBoxes value={otp} onChange={setOtp} />
                </InputWrapper>
                <PrimaryButton type="submit" loading={loading} disabled={!isValidOTP(otp)}>
                  Verify OTP →
                </PrimaryButton>
              </form>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <button
                  onClick={() => { setStep('SEND_OTP'); clear(); }}
                  style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', padding: 0 }}
                >
                  ← Change email
                </button>
                {countdown === 0 ? (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    style={{ background: 'none', border: 'none', color: '#1DB47F', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>
                    Resend in {formatCountdown(countdown)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 'NEW_PASSWORD' && (
            <div className="rk-step">
              <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px', color: '#111827', fontFamily: 'Georgia, serif' }}>
                Create New Password
              </h2>
              <p style={{ color: '#6B7280', marginBottom: 28, fontSize: 14, lineHeight: 1.6 }}>
                Choose a strong password you haven't used before.
              </p>
              <form onSubmit={handleResetPassword}>
                <InputWrapper>
                  <Label>New Password</Label>
                  <div style={{ position: 'relative' }}>
                    <Input
                      icon="🔒"
                      type={showPw ? 'text' : 'password'}
                      required
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(p => !p)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9CA3AF' }}
                    >
                      {showPw ? '🙈' : '👁'}
                    </button>
                  </div>
                  <PasswordStrengthBar password={password} />
                </InputWrapper>

                <InputWrapper>
                  <Label>Confirm Password</Label>
                  <div style={{ position: 'relative' }}>
                    <Input
                      icon="🔒"
                      type={showCpw ? 'text' : 'password'}
                      required
                      placeholder="Repeat your password"
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      style={{ borderColor: confirmPw && confirmPw !== password ? '#EF4444' : undefined }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCpw(p => !p)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9CA3AF' }}
                    >
                      {showCpw ? '🙈' : '👁'}
                    </button>
                  </div>
                  {confirmPw && confirmPw !== password && (
                    <p style={{ fontSize: 12, color: '#EF4444', margin: '4px 0 0' }}>
                      Passwords don't match
                    </p>
                  )}
                </InputWrapper>

                <PrimaryButton type="submit" loading={loading}>
                  Update Password →
                </PrimaryButton>
              </form>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === 'SUCCESS' && (
            <div className="rk-step" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px', color: '#111827', fontFamily: 'Georgia, serif' }}>
                Password Updated!
              </h2>
              <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
                Your password has been changed. Log in with your new credentials.
              </p>
              <PrimaryButton onClick={() => window.location.href = '/login'}>
                Go to Log In →
              </PrimaryButton>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ForgotPassword;