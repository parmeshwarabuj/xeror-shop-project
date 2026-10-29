
import { useState } from 'react'
import './CustomerRegistration.css'

export default function CustomerRegistration({ onNavigate }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [loading, setLoading] = useState(false)

  const [alertBox, setAlertBox] = useState({
    show: false,
    type: 'error',
    title: '',
    message: '',
    onClose: null,
  })

  function showAlert(message, type = 'error', title, onClose = null) {
    setAlertBox({
      show: true,
      type,
      title: title || (type === 'success' ? 'Success!' : 'Oops!'),
      message,
      onClose,
    })
  }

  function closeAlert() {
    const callback = alertBox.onClose

    setAlertBox((previous) => ({
      ...previous,
      show: false,
      onClose: null,
    }))

    if (callback) callback()
  }

  function update(e) {
    const { name, value } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function submit(e) {
    e.preventDefault()

    if (loading) return

    const name = form.name.trim()
    const phone = form.phone.trim()
    const email = form.email.trim()
    const password = form.password
    const confirmPassword = form.confirmPassword

    // Full name
    if (!name) {
      showAlert('Please enter your full name.')
      return
    }

    if (name.length < 2 || name.length > 150) {
      showAlert('Full name must be between 2 and 150 characters.')
      return
    }

    if (!/^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u.test(name)) {
      showAlert(
        'Name can contain letters, spaces, apostrophes, dots and hyphens only.'
      )
      return
    }

    // Mobile number
    if (!phone) {
      showAlert('Please enter your mobile number.')
      return
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      showAlert('Please enter a valid mobile number.')
      return
    }

    const digitsOnly = phone.replace(/\D/g, '')

    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      showAlert('Mobile number must contain 7 to 15 digits.')
      return
    }

    // Optional email
    if (email) {
      if (email.length > 150) {
        showAlert('Email must not exceed 150 characters.')
        return
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAlert('Please enter a valid email address.')
        return
      }
    }

    // Password
    if (!password) {
      showAlert('Please enter a password.')
      return
    }

    if (password.length < 8 || password.length > 72) {
      showAlert('Password must contain 8 to 72 characters.')
      return
    }

    if (!/[A-Z]/.test(password)) {
      showAlert('Password must contain at least one uppercase letter.')
      return
    }

    if (!/[a-z]/.test(password)) {
      showAlert('Password must contain at least one lowercase letter.')
      return
    }

    if (!/[0-9]/.test(password)) {
      showAlert('Password must contain at least one number.')
      return
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      showAlert('Password must contain at least one special character.')
      return
    }

    // Confirm password
    if (!confirmPassword) {
      showAlert('Please confirm your password.')
      return
    }

    if (password !== confirmPassword) {
      showAlert('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:8080/api/customers',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            fullName: name,
            phone,
            email: email || null,
            password,
          }),
        }
      )

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Could not register customer.')
      }

      setForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
      })

      showAlert(
        'Your customer account has been created successfully.',
        'success',
        'Registration complete!',
        () => onNavigate('customer-login')
      )
    } catch (error) {
      showAlert(
        error.message ||
          'Could not connect to the backend. Check that it is running.',
        'error',
        'Registration failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="xw-register-page">
      <header className="xw-register-header">
        <button
          className="xw-register-brand"
          type="button"
          onClick={() => onNavigate('customer-login')}
        >
          <span className="xw-register-brand-icon">X</span>
          <span>
            Xerox
            <span className="xw-register-brand-accent">Wala</span>
          </span>
        </button>

        <button
          className="xw-register-back"
          type="button"
          onClick={() => onNavigate('customer-login')}
        >
          ← Back to login
        </button>
      </header>

      <section className="xw-register-layout">
        <div className="xw-register-intro">
          <span className="xw-register-eyebrow">
            <span className="xw-register-status-dot" />
            YOUR PRINTING PARTNER
          </span>

          <h1>
            Print smarter.
            <br />
            <span>Live simpler.</span>
          </h1>

          <p>
            Create your XeroxWala account to get started with
            convenient online printing and order management.
          </p>

          <div className="xw-register-benefits">
            <div className="xw-register-benefit">
              <span className="xw-register-benefit-icon">↗</span>
              <div>
                <strong>Easy ordering</strong>
                <small>Prepare your documents for printing.</small>
              </div>
            </div>

            <div className="xw-register-benefit">
              <span className="xw-register-benefit-icon">▤</span>
              <div>
                <strong>Order tracking</strong>
                <small>Keep your print orders organised.</small>
              </div>
            </div>
          </div>

          <div className="xw-register-printer-scene" aria-hidden="true">
            <div className="xw-register-paper xw-register-paper-back">
              <span />
              <span />
              <span />
            </div>

            <div className="xw-register-paper xw-register-paper-front">
              <strong>YOUR DOCUMENT</strong>
              <span />
              <span />
              <span />
              <div className="xw-register-paper-lines" />
            </div>

            <div className="xw-register-printer">
              <div className="xw-register-printer-top">
                <span className="xw-register-printer-light" />
                <span className="xw-register-printer-slot" />
              </div>

              <div className="xw-register-printer-body">
                <div className="xw-register-printer-panel">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="xw-register-printer-output" />
              </div>

              <div className="xw-register-printer-base" />
            </div>

            <div className="xw-register-scene-shadow" />
          </div>

          <div className="xw-register-trust">
            <span>✦</span>
            Made for your everyday printing needs
          </div>
        </div>

        <div className="xw-register-card">
          <div className="xw-register-card-heading">
            <div className="xw-register-card-symbol">✳</div>
            <span className="xw-register-step">CUSTOMER ACCOUNT</span>
            <h2>Create your account</h2>
            <p>Enter your details to get started.</p>
          </div>

          <form className="xw-register-form" onSubmit={submit} noValidate>
            <div className="xw-register-field">
              <label htmlFor="register-name">Full name *</label>
              <input
                id="register-name"
                name="name"
                type="text"
                value={form.name}
                onChange={update}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={150}
                required
              />
            </div>

            <div className="xw-register-field">
              <label htmlFor="register-phone">Mobile number *</label>
              <input
                id="register-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={update}
                placeholder="Enter your mobile number"
                autoComplete="tel"
                maxLength={20}
                required
              />
            </div>

            <div className="xw-register-field">
              <label htmlFor="register-email">
                Email address <span>(optional)</span>
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                value={form.email}
                onChange={update}
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={150}
              />
            </div>

            <div className="xw-register-field">
              <label htmlFor="register-password">Password *</label>
              <input
                id="register-password"
                name="password"
                type="password"
                value={form.password}
                onChange={update}
                placeholder="Create a strong password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
              />
              <small className="xw-register-validation-hint">
                8–72 characters, including uppercase, lowercase,
                a number and a special character.
              </small>
            </div>

            <div className="xw-register-field">
              <label htmlFor="register-confirm-password">
                Confirm password *
              </label>
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={update}
                placeholder="Enter your password again"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
              />
            </div>

            <button
              className="xw-register-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="xw-register-login-prompt">
            Already have an account?
            <button
              type="button"
              onClick={() => onNavigate('customer-login')}
            >
              Log in
            </button>
          </div>

          <div className="xw-register-card-footer">
            XeroxWala · Your documents, made easy
          </div>
        </div>
      </section>

      <footer className="xw-register-footer">
        © XeroxWala · Online print ordering
      </footer>

      {alertBox.show && (
        <div
          className="xw-alert-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeAlert()
          }}
        >
          <div
            className={`xw-alert-card xw-alert-${alertBox.type}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="xw-alert-title"
            aria-describedby="xw-alert-message"
          >
            <button
              className="xw-alert-close"
              type="button"
              aria-label="Close alert"
              onClick={closeAlert}
            >
              ×
            </button>

            <div className="xw-alert-icon" aria-hidden="true">
              {alertBox.type === 'success' ? '✓' : '!'}
            </div>

            <h3 id="xw-alert-title">{alertBox.title}</h3>

            <p id="xw-alert-message">{alertBox.message}</p>

            <button
              type="button"
              className="xw-alert-button"
              onClick={closeAlert}
              autoFocus
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
