import React from 'react';

type Step = 'SEND_OTP' | 'VERIFY_OTP' | 'NEW_PASSWORD' | 'SUCCESS';

const LeftPanel = ({ step }: { step: Step }) => {
  const content: Record<Step, { headline: string; sub: string; icon: string }> = {
    SEND_OTP:     { headline: 'Forgot your password?', sub: "No worries — we'll send a one-time code to your inbox.", icon: '🔑' },
    VERIFY_OTP:   { headline: 'Check your inbox.',     sub: 'Enter the 6-digit code we just sent you.',              icon: '📬' },
    NEW_PASSWORD: { headline: 'Almost there.',         sub: 'Create a strong new password for your account.',        icon: '🔒' },
    SUCCESS:      { headline: "You're back in!",       sub: 'Your password has been updated. Log in to continue.',   icon: '🎉' },
  };
  const { headline, sub, icon } = content[step];

  return (
    <div style={{
      width: '40%',
      background: 'linear-gradient(145deg, #0f9660 0%, #1DB47F 60%, #16a871 100%)',
      padding: '48px 40px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden', minHeight: '100vh',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: -60,  right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
      <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

      {/* Top: logo + copy */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{
            width: 36, height: 36,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🏠</div>
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
            RentKaroo
          </span>
        </div>

        <div style={{ fontSize: 40, marginBottom: 20 }}>{icon}</div>
        <h1 style={{
          color: '#fff', fontSize: 32, fontWeight: 800, lineHeight: 1.2,
          margin: '0 0 16px', fontFamily: 'Georgia, serif',
        }}>
          {headline}
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 1.6,
          margin: 0, fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {sub}
        </p>
      </div>

      {/* Bottom: trust badges */}
      <div>
        {[
          { icon: '🛡️', text: 'Secure OTP verification' },
          { icon: '⚡', text: 'Reset in under 2 minutes' },
        ].map(({ icon, text }) => (
          <div key={text} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 12,
          }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span style={{ color: '#fff', fontSize: 13, fontFamily: 'Inter, system-ui, sans-serif' }}>{text}</span>
          </div>
        ))}
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
          EST. 2026
        </p>
      </div>
    </div>
  );
};

export default LeftPanel;
