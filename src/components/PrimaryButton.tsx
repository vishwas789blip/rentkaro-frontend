import React from 'react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

const PrimaryButton = ({
  children, loading, disabled, onClick, type = 'button',
}: PrimaryButtonProps) => (
  <button
    type={type}
    disabled={loading || disabled}
    onClick={onClick}
    style={{
      width: '100%',
      padding: '14px',
      background: loading || disabled ? '#9CA3AF' : '#111827',
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      fontSize: 15,
      fontWeight: 600,
      cursor: loading || disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: 'background 0.2s',
      fontFamily: 'Inter, system-ui, sans-serif',
      letterSpacing: '0.01em',
    }}
    onMouseEnter={e => { if (!loading && !disabled) e.currentTarget.style.background = '#1DB47F'; }}
    onMouseLeave={e => { if (!loading && !disabled) e.currentTarget.style.background = '#111827'; }}
  >
    {loading && (
      <span style={{
        width: 18, height: 18,
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'rk-spin 0.7s linear infinite',
        display: 'inline-block',
        flexShrink: 0,
      }} />
    )}
    {children}
  </button>
);

export default PrimaryButton;
