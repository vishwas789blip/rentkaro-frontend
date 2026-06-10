import React from 'react';

// ── Label ─────────────────────────────────────────────────────

export const Label = ({ children }: { children: React.ReactNode }) => (
  <label style={{
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#1DB47F',
    marginBottom: 8,
    fontFamily: 'Inter, system-ui, sans-serif',
  }}>
    {children}
  </label>
);

// ── InputWrapper ──────────────────────────────────────────────

export const InputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ marginBottom: 20 }}>{children}</div>
);

// ── Input ─────────────────────────────────────────────────────

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, style, ...props }, ref) => (
    <div style={{ position: 'relative' }}>
      {icon && (
        <span style={{
          position: 'absolute', left: 14, top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 16, color: '#9CA3AF', pointerEvents: 'none',
        }}>
          {icon}
        </span>
      )}
      <input
        ref={ref}
        {...props}
        style={{
          width: '100%',
          padding: icon ? '13px 14px 13px 40px' : '13px 14px',
          border: '1.5px solid #E5E7EB',
          borderRadius: 10,
          fontSize: 15,
          color: '#111827',
          background: '#F9FAFB',
          outline: 'none',
          boxSizing: 'border-box' as const,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          fontFamily: 'Inter, system-ui, sans-serif',
          ...style,
        }}
        onFocus={e => {
          e.target.style.borderColor = '#1DB47F';
          e.target.style.boxShadow   = '0 0 0 3px rgba(29,180,127,0.12)';
          e.target.style.background  = '#fff';
        }}
        onBlur={e => {
          e.target.style.borderColor = '#E5E7EB';
          e.target.style.boxShadow   = 'none';
          e.target.style.background  = '#F9FAFB';
        }}
      />
    </div>
  )
);
Input.displayName = 'Input';
