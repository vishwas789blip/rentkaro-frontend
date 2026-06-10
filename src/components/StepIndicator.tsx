import React from 'react';

type Step = 'SEND_OTP' | 'VERIFY_OTP' | 'NEW_PASSWORD' | 'SUCCESS';

const STEP_ORDER: Step[] = ['SEND_OTP', 'VERIFY_OTP', 'NEW_PASSWORD', 'SUCCESS'];
const STEP_LABELS = ['Email', 'Verify', 'Password'];

const StepIndicator = ({ current }: { current: Step }) => {
  const currentIdx = STEP_ORDER.indexOf(current);

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
      {STEP_LABELS.map((label, i) => {
        const done   = i < currentIdx;
        const active = i === currentIdx;

        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done ? '#1DB47F' : active ? '#111827' : '#E5E7EB',
                color: done || active ? '#fff' : '#9CA3AF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                transition: 'background 0.3s',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 11, marginTop: 4,
                fontWeight: active ? 700 : 400,
                color: active ? '#111827' : '#9CA3AF',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>
                {label}
              </span>
            </div>

            {i < STEP_LABELS.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 6px', marginBottom: 16,
                background: done ? '#1DB47F' : '#E5E7EB',
                transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
