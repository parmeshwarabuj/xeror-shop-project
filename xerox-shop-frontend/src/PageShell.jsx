
const card = {
  width: 'min(100% - 32px, 460px)',
  margin: '48px auto',
  padding: '28px',
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '18px',
  boxShadow: '0 12px 35px rgba(15,23,42,.08)',
  boxSizing: 'border-box',
}

// eslint-disable-next-line react-refresh/only-export-components
export const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 13px',
  margin: '6px 0 14px',
  border: '1px solid #d1d5db',
  borderRadius: '9px',
  fontSize: '15px',
}

// eslint-disable-next-line react-refresh/only-export-components
export const buttonStyle = {
  width: '100%',
  padding: '12px 16px',
  border: 0,
  borderRadius: '9px',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  marginTop: '6px',
}

// eslint-disable-next-line react-refresh/only-export-components
export const labelStyle = {
  display: 'block',
  color: '#374151',
  fontSize: '14px',
  fontWeight: 600,
}

// eslint-disable-next-line react-refresh/only-export-components
export const linkStyle = {
  color: '#2563eb',
  background: 'none',
  border: 0,
  padding: 0,
  cursor: 'pointer',
  fontWeight: 600,
  textDecoration: 'underline',
}

export default function PageShell({
  title,
  subtitle,
  onHome,
  children,
}) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '1px 0 40px',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '24px auto',
          padding: '0 16px',
        }}
      >
        <button
          type="button"
          onClick={onHome}
          style={{
            border: 0,
            background: 'transparent',
            color: '#2563eb',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          ← XeroxWala home
        </button>
      </div>

      <section style={card}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              margin: '0 auto 12px',
              width: '54px',
              height: '54px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '16px',
              background: '#dbeafe',
              color: '#1d4ed8',
              fontSize: '25px',
              fontWeight: 800,
            }}
          >
            X
          </div>

          <h1
            style={{
              margin: '0 0 8px',
              color: '#111827',
              fontSize: '27px',
            }}
          >
            {title}
          </h1>

          <p
            style={{
              margin: 0,
              color: '#64748b',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        </div>

        {children}
      </section>
    </main>
  )
}
