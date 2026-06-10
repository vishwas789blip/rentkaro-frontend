import { getPasswordStrength } from '@/lib/utils';

interface PasswordStrengthBarProps {
  password: string;
}

const PasswordStrengthBar = ({ password }: PasswordStrengthBarProps) => {
  const s = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div style={{ marginTop: 10 }}>
      {/* 4-segment bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= s.score ? s.color : '#E5E7EB',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Label */}
      <p style={{
        fontSize: 12,
        color: s.color,
        margin: 0,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        {s.label} password
      </p>
    </div>
  );
};

export default PasswordStrengthBar;
