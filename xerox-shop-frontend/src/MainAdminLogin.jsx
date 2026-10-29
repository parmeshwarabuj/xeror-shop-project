
import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function MainAdminLogin({ onLogin, onBack }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      const auth = btoa(`${username.trim()}:${password}`)

      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? 'Admin login failed. Check your credentials and admin role.'
            : `Unable to sign in (${response.status}).`
        )
      }

      const data = await response.json()

      sessionStorage.setItem('xeroxwalaAdminAuth', auth)
      onLogin(data)
    } catch (err) {
      setError(err.message || 'Could not connect to the backend.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: 20,
      background: '#f1f5f9',
      fontFamily: 'Arial, sans-serif',
    }}>
      <section style={{
        width: 'min(420px, 100%)',
        boxSizing: 'border-box',
        padding: 30,
        borderRadius: 18,
        background: '#fff',
        boxShadow: '0 12px 40px rgba(15, 23, 42, 0.10)',
      }}>
        <div style={{
          width: 54,
          height: 54,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 14,
          background: '#1d4ed8',
          color: '#fff',
          fontSize: 28,
          fontWeight: 800,
          marginBottom: 20,
        }}>X</div>

        <h1 style={{ margin: '0 0 8px', color: '#172033' }}>
          Main Admin Login
        </h1>
        <p style={{ margin: '0 0 24px', color: '#64748b', lineHeight: 1.6 }}>
          Sign in to manage customers, shops, orders and approvals.
        </p>

        <form onSubmit={submit}>
          <label htmlFor="admin-username" style={{
            display: 'block', marginBottom: 7, fontWeight: 700, fontSize: 14,
          }}>Admin username</label>
          <input
            id="admin-username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            required
            style={{
              width: '100%', boxSizing: 'border-box', padding: 12,
              border: '1px solid #cbd5e1', borderRadius: 9, marginBottom: 18,
            }}
          />

          <label htmlFor="admin-password" style={{
            display: 'block', marginBottom: 7, fontWeight: 700, fontSize: 14,
          }}>Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            style={{
              width: '100%', boxSizing: 'border-box', padding: 12,
              border: '1px solid #cbd5e1', borderRadius: 9, marginBottom: 18,
            }}
          />

          {error && (
            <p role="alert" style={{
              color: '#b91c1c', background: '#fef2f2',
              padding: 12, borderRadius: 8, fontSize: 13,
            }}>{error}</p>
          )}

          <button type="submit" disabled={busy} style={{
            width: '100%', padding: 13, border: 0, borderRadius: 9,
            background: busy ? '#93c5fd' : '#1d4ed8',
            color: '#fff', fontWeight: 700, cursor: busy ? 'wait' : 'pointer',
          }}>
            {busy ? 'Checking credentials...' : 'Sign in as Admin'}
          </button>
        </form>

        <button type="button" onClick={onBack} style={{
          width: '100%', marginTop: 14, padding: 11,
          background: 'transparent', border: 0, color: '#2563eb',
          cursor: 'pointer', fontWeight: 600,
        }}>← Back to customer page</button>
      </section>
    </main>
  )
}
