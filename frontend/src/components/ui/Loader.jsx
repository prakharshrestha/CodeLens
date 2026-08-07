export default function Loader({ size = 36, text }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '16px' }}>
      <div
        className="spinner"
        style={{ width: size, height: size, borderWidth: size > 30 ? 3 : 2 }}
      />
      {text && <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{text}</span>}
    </div>
  )
}

export function InlineLoader({ size = 16 }) {
  return (
    <div
      className="spinner"
      style={{ width: size, height: size, borderWidth: 2, display: 'inline-block' }}
    />
  )
}
