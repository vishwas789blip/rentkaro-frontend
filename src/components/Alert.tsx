interface AlertProps {
  type: 'success' | 'error';
  message: string;
}

const Alert = ({ type, message }: AlertProps) => (
  <div style={{
    padding: '12px 14px',
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 14,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    background: type === 'success' ? '#ECFDF5' : '#FEF2F2',
    border: `1px solid ${type === 'success' ? '#A7F3D0' : '#FECACA'}`,
    color: type === 'success' ? '#065F46' : '#991B1B',
    fontFamily: 'Inter, system-ui, sans-serif',
  }}>
    <span style={{ fontSize: 16, lineHeight: 1.4, flexShrink: 0 }}>
      {type === 'success' ? '✓' : '⚠'}
    </span>
    <span>{message}</span>
  </div>
);

export default Alert;
