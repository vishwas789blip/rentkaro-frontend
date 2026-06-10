import React from 'react';

interface OTPBoxesProps {
  value: string;
  onChange: (v: string) => void;
  length?: number;
}

const OTPBoxes = ({ value, onChange, length = 6 }: OTPBoxesProps) => {
  const digits = Array.from({ length }, (_, i) => value[i] || '');
  const refs   = Array.from({ length }, () => React.createRef<HTMLInputElement>());

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const next = [...digits];
      if (next[i]) {
        next[i] = '';
        onChange(next.join(''));
      } else if (i > 0) {
        next[i - 1] = '';
        onChange(next.join(''));
        refs[i - 1].current?.focus();
      }
    } else if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      const next = [...digits];
      next[i] = e.key;
      onChange(next.join(''));
      if (i < length - 1) refs[i + 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted.padEnd(length, '').slice(0, length));
    refs[Math.min(pasted.length, length - 1)].current?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={() => {}}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width: 48, height: 54,
            textAlign: 'center',
            fontSize: 22, fontWeight: 700,
            border: `2px solid ${d ? '#1DB47F' : '#E5E7EB'}`,
            borderRadius: 10,
            background: d ? '#ECFDF5' : '#F9FAFB',
            color: '#111827',
            outline: 'none',
            transition: 'border-color 0.15s',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#1DB47F';
            e.target.style.boxShadow = '0 0 0 3px rgba(29,180,127,0.15)';
          }}
          onBlur={e => {
            e.target.style.borderColor = d ? '#1DB47F' : '#E5E7EB';
            e.target.style.boxShadow = 'none';
          }}
        />
      ))}
    </div>
  );
};

export default OTPBoxes;
