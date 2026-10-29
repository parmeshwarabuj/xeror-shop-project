
import { useState } from 'react'

export default function CustomerLogin({ onNavigate }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch(
        'http://localhost:8080/api/customers/login',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identifier: identifier.trim(),
            password,
          }),
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            'Incorrect mobile/email or password.'
          )
        }

        const message = await response.text()
        throw new Error(message || 'Login failed.')
      }

      const customer = await response.json()

      sessionStorage.setItem(
        'xeroxwalaCustomer',
        JSON.stringify(customer)
      )

      setCustomerName(customer.fullName || 'Customer')
      setShowSuccess(true)
    } catch (error) {
      setErrorMessage(
        error.message ||
          'Could not connect to the backend. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="xw-login-page">
      <style>{`
        .xw-login-page {
          min-height: 100vh;
          box-sizing: border-box;
          padding: 28px clamp(18px, 5vw, 76px);
          color: #172554;
          background:
            radial-gradient(ellipse at 12% 15%, #dbeafe 0, transparent 35%),
            radial-gradient(ellipse at 85% 85%, #ede9fe 0, transparent 34%),
            linear-gradient(135deg, #f8fbff, #eef4ff 55%, #f8f7ff);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          overflow: hidden;
        }

        .xw-login-page * {
          box-sizing: border-box;
        }

        .xw-login-nav {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .xw-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          color: #172554;
          font-size: 23px;
          font-weight: 850;
          letter-spacing: -1px;
          text-decoration: none;
        }

        .xw-brand-icon {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          color: white;
          border-radius: 14px;
          background: linear-gradient(145deg, #60a5fa, #4338ca);
          box-shadow: 0 7px 0 #c7d2fe, 0 12px 24px #4f46e544;
          transform: rotate(-5deg);
        }

        .xw-brand span:last-child {
          color: #4f46e5;
        }

        .xw-nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .xw-small-btn {
          border: 1px solid #dbe4f4;
          background: #ffffffbb;
          color: #334155;
          border-radius: 12px;
          padding: 11px 15px;
          font-weight: 700;
          cursor: pointer;
          transition: .2s ease;
        }

        .xw-small-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 16px #64748b20;
        }

        .xw-login-layout {
          max-width: 1240px;
          margin: 54px auto 35px;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(340px, .85fr);
          align-items: center;
          gap: clamp(35px, 7vw, 100px);
        }

        .xw-hero {
          padding: 12px 0;
        }

        .xw-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 13px;
          border: 1px solid #c7d2fe;
          border-radius: 999px;
          color: #4338ca;
          background: #ffffffaa;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 1.4px;
        }

        .xw-live-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 0 4px #dcfce7;
        }

        .xw-hero h1 {
          max-width: 650px;
          margin: 24px 0 17px;
          font-size: clamp(42px, 5.2vw, 70px);
          line-height: 1.03;
          letter-spacing: -3.6px;
          color: #172554;
        }

        .xw-hero h1 span {
          display: block;
          color: #4f46e5;
          text-shadow: 0 4px 0 #c7d2fe;
        }

        .xw-hero-copy {
          max-width: 470px;
          color: #64748b;
          font-size: 16px;
          line-height: 1.85;
        }

        .xw-benefits {
          display: flex;
          flex-wrap: wrap;
          gap: 11px;
          margin-top: 24px;
        }

        .xw-benefit {
          padding: 10px 13px;
          border: 1px solid #e0e7ff;
          border-radius: 12px;
          background: #ffffffb8;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
        }

        .xw-benefit b {
          color: #4f46e5;
          margin-right: 5px;
        }

        .xw-scene {
          position: relative;
          height: 255px;
          max-width: 440px;
          margin-top: 30px;
          perspective: 850px;
        }

        .xw-scene-glow {
          position: absolute;
          width: 260px;
          height: 190px;
          left: 50%;
          top: 26px;
          transform: translateX(-50%);
          border-radius: 50%;
          background: #c7d2fe99;
          opacity: .45;
        }

        .xw-paper {
          position: absolute;
          width: 142px;
          height: 174px;
          left: 50%;
          top: 5px;
          padding: 22px 15px;
          border: 1px solid #dbeafe;
          border-radius: 10px;
          background: linear-gradient(135deg, #fff, #f8fbff);
          box-shadow: 9px 12px 0 #dbe4f5, 0 25px 35px #33415520;
          transform: translateX(-50%) rotateY(-14deg) rotateZ(7deg);
          animation: xw-float 4s ease-in-out infinite;
        }

        .xw-paper-logo {
          margin-bottom: 15px;
          color: #4f46e5;
          font-size: 20px;
          font-weight: 900;
        }

        .xw-paper-line {
          height: 5px;
          margin: 9px 0;
          border-radius: 5px;
          background: #dbe4f0;
        }

        .xw-paper-line.short {
          width: 55%;
        }

        .xw-paper-line.long {
          width: 95%;
        }

        .xw-paper-chart {
          display: flex;
          align-items: end;
          gap: 5px;
          height: 37px;
          margin: 12px 0;
        }

        .xw-paper-chart span {
          flex: 1;
          border-radius: 4px 4px 0 0;
          background: linear-gradient(#818cf8, #4f46e5);
        }

        .xw-paper-chart span:nth-child(1) { height: 40%; }
        .xw-paper-chart span:nth-child(2) { height: 85%; }
        .xw-paper-chart span:nth-child(3) { height: 60%; }
        .xw-paper-chart span:nth-child(4) { height: 100%; }

        .xw-printer {
          position: absolute;
          z-index: 2;
          width: 228px;
          height: 116px;
          left: 50%;
          bottom: 14px;
          transform: translateX(-50%) rotateY(-10deg);
          border-radius: 18px 18px 23px 23px;
          background: linear-gradient(145deg, #ffffff, #cbd5e1);
          box-shadow: 0 13px 0 #94a3b8, 0 26px 35px #33415535;
        }

        .xw-printer-top {
          position: absolute;
          width: 180px;
          height: 32px;
          top: -14px;
          left: 24px;
          border: 1px solid #cbd5e1;
          border-radius: 12px 12px 4px 4px;
          background: linear-gradient(120deg, #f8fafc, #cbd5e1);
          transform: skewY(-4deg);
        }

        .xw-printer-slot {
          position: absolute;
          width: 144px;
          height: 9px;
          top: 23px;
          left: 42px;
          border-radius: 8px;
          background: #475569;
          box-shadow: inset 0 3px 5px #0f172a;
        }

        .xw-printer-front {
          position: absolute;
          width: 154px;
          height: 49px;
          left: 37px;
          bottom: 8px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .xw-printer-front span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #818cf8;
        }

        .xw-printer-front span:first-child {
          background: #22c55e;
          box-shadow: 0 0 9px #22c55e88;
        }

        .xw-float-tag {
          position: absolute;
          z-index: 3;
          padding: 12px 15px;
          border: 1px solid #ffffff;
          border-radius: 14px;
          background: #ffffffed;
          box-shadow: 0 12px 28px #3341551c;
          color: #334155;
          font-size: 12px;
          font-weight: 800;
        }

        .xw-tag-left {
          left: 0;
          top: 64px;
          transform: rotate(-5deg);
        }

        .xw-tag-right {
          right: 0;
          bottom: 42px;
          transform: rotate(4deg);
        }

        @keyframes xw-float {
          0%, 100% { margin-top: 0; }
          50% { margin-top: -10px; }
        }

        .xw-login-card {
          position: relative;
          padding: clamp(25px, 3vw, 39px);
          border: 1px solid #e2e8f0;
          border-radius: 27px;
          background: #ffffff;
          box-shadow: 0 18px 45px rgba(30, 41, 59, .12);
        }

        .xw-card-icon {
          display: grid;
          place-items: center;
          width: 55px;
          height: 55px;
          margin-bottom: 23px;
          border-radius: 17px;
          color: #fff;
          font-size: 24px;
          background: linear-gradient(145deg, #6366f1, #3730a3);
          box-shadow: 0 6px 0 #c7d2fe, 0 12px 25px #4f46e533;
        }

        .xw-login-card h2 {
          margin: 0 0 8px;
          color: #172554;
          font-size: 30px;
          letter-spacing: -1px;
        }

        .xw-card-subtitle {
          margin: 0 0 27px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
        }

        .xw-field {
          margin-bottom: 19px;
        }

        .xw-field label {
          display: block;
          margin-bottom: 9px;
          color: #334155;
          font-size: 13px;
          font-weight: 800;
        }

        .xw-input-wrap {
          position: relative;
        }

        .xw-input {
          display: block;
          width: 100%;
          min-height: 51px;
          padding: 13px 15px;
          border: 1px solid #dbe4f0;
          border-radius: 12px;
          outline: none;
          background: #f8faff;
          color: #172554;
          font: inherit;
          font-size: 14px;
          transition: .2s ease;
        }

        .xw-input:focus {
          border-color: #818cf8;
          background: #fff;
          box-shadow: 0 0 0 4px #818cf81c;
        }

        .xw-password-input {
          padding-right: 72px;
        }

        .xw-show-password {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: #4f46e5;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .xw-submit {
          width: 100%;
          min-height: 53px;
          margin-top: 4px;
          border: 0;
          border-radius: 13px;
          background: linear-gradient(110deg, #4f46e5, #3730a3);
          box-shadow: 0 5px 0 #c7d2fe, 0 12px 22px #4f46e533;
          color: white;
          font-size: 15px;
          font-weight: 850;
          cursor: pointer;
          transition: .2s ease;
        }

        .xw-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 7px 0 #c7d2fe, 0 16px 26px #4f46e533;
        }

        .xw-submit:disabled {
          opacity: .65;
          cursor: wait;
        }

        .xw-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 25px 0 20px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .xw-divider::before,
        .xw-divider::after {
          content: '';
          height: 1px;
          flex: 1;
          background: #e2e8f0;
        }

        .xw-link-list {
          display: grid;
          gap: 11px;
        }

        .xw-link-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          padding: 12px 13px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffffb8;
          color: #475569;
          text-align: left;
          font-size: 12px;
        }

        .xw-link-row button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #4338ca;
          font: inherit;
          font-weight: 850;
          white-space: nowrap;
          cursor: pointer;
        }

        .xw-link-row button:hover {
          text-decoration: underline;
        }

        .xw-login-footer {
          max-width: 1240px;
          margin: 35px auto 0;
          padding-top: 20px;
          border-top: 1px solid #dbe4f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          flex-wrap: wrap;
          color: #64748b;
          font-size: 12px;
        }

        .xw-footer-admin {
          border: 0;
          background: transparent;
          color: #64748b;
          font-size: 12px;
          cursor: pointer;
        }

        .xw-footer-admin:hover {
          color: #4338ca;
        }

        /* Custom popup */
        .xw-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, .58);
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(7px);
          animation: xw-overlay-in .2s ease-out;
        }

        .xw-modal {
          width: 100%;
          max-width: 390px;
          padding: 32px 27px 27px;
          border: 1px solid #e0e7ff;
          border-radius: 25px;
          background: #fff;
          box-shadow: 0 30px 90px rgba(15, 23, 42, .3);
          text-align: center;
          animation: xw-modal-in .28s ease-out;
        }

        .xw-modal-icon {
          display: grid;
          place-items: center;
          width: 72px;
          height: 72px;
          margin: 0 auto 19px;
          border-radius: 23px;
          color: white;
          font-size: 37px;
          font-weight: 800;
          background: linear-gradient(145deg, #60a5fa, #4f46e5 65%, #7c3aed);
          box-shadow: 0 7px 0 #c7d2fe, 0 14px 27px #4f46e533;
        }

        .xw-modal h2 {
          margin: 0 0 10px;
          color: #172554;
          font-size: 26px;
          letter-spacing: -.7px;
        }

        .xw-modal p {
          margin: 0 0 24px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }

        .xw-modal-primary {
          width: 100%;
          min-height: 50px;
          padding: 13px 17px;
          border: 0;
          border-radius: 13px;
          background: linear-gradient(110deg, #4f46e5, #3730a3);
          box-shadow: 0 4px 0 #c7d2fe, 0 10px 20px #4f46e526;
          color: white;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: transform .2s ease;
        }

        .xw-modal-primary:hover {
          transform: translateY(-2px);
        }

        .xw-modal-secondary {
          margin-top: 16px;
          padding: 5px 10px;
          border: 0;
          background: transparent;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .xw-modal-secondary:hover {
          color: #4338ca;
        }

        .xw-error-icon {
          background: linear-gradient(145deg, #fb7185, #e11d48);
          box-shadow: 0 7px 0 #fecdd3, 0 14px 27px #e11d4826;
        }

        @keyframes xw-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes xw-modal-in {
          from {
            opacity: 0;
            transform: translateY(12px) scale(.94);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 900px) {
          .xw-login-layout {
            grid-template-columns: 1fr;
            max-width: 560px;
            margin-top: 38px;
            gap: 24px;
          }

          .xw-hero {
            text-align: center;
          }

          .xw-hero h1 {
            margin-left: auto;
            margin-right: auto;
          }

          .xw-hero-copy {
            margin-left: auto;
            margin-right: auto;
          }

          .xw-benefits {
            justify-content: center;
          }

          .xw-scene {
            margin-left: auto;
            margin-right: auto;
          }
        }

        @media (max-width: 480px) {
          .xw-login-page {
            padding: 18px 15px;
          }

          .xw-brand {
            font-size: 19px;
          }

          .xw-brand-icon {
            width: 38px;
            height: 38px;
          }

          .xw-nav-actions .xw-small-btn {
            padding: 9px 10px;
            font-size: 11px;
          }

          .xw-login-layout {
            margin-top: 27px;
          }

          .xw-hero h1 {
            font-size: 45px;
            letter-spacing: -2.5px;
          }

          .xw-scene {
            transform: scale(.88);
            transform-origin: top center;
            margin-bottom: -25px;
          }

          .xw-login-card {
            padding: 24px 19px;
            border-radius: 21px;
          }

          .xw-login-card h2 {
            font-size: 27px;
          }

          .xw-login-footer {
            justify-content: center;
            text-align: center;
          }

          .xw-link-row {
            align-items: flex-start;
          }

          .xw-modal {
            padding: 29px 21px 23px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .xw-paper {
            animation: none;
          }

          .xw-small-btn,
          .xw-submit,
          .xw-modal-primary {
            transition: none;
          }

          .xw-modal-overlay,
          .xw-modal {
            animation: none;
          }
        }
      `}</style>

      <header className="xw-login-nav">
        <a
          className="xw-brand"
          href="#home"
          onClick={(e) => {
            e.preventDefault()
            onNavigate('customer-login')
          }}
        >
          <span className="xw-brand-icon">X</span>
          <span>
            Xerox<span>Wala</span>
          </span>
        </a>

        <div className="xw-nav-actions">
          <button
            className="xw-small-btn"
            type="button"
            onClick={() => onNavigate('guest')}
          >
            Guest Order
          </button>

          <button
            className="xw-small-btn"
            type="button"
            onClick={() => onNavigate('owner-login')}
          >
            Shop Owner
          </button>
        </div>
      </header>

      <main className="xw-login-layout">
        <section className="xw-hero">
          <span className="xw-eyebrow">
            <span className="xw-live-dot" />
            SMARTER PRINTING STARTS HERE
          </span>

          <h1>
            Your work.
            <span>Our print.</span>
          </h1>

          <p className="xw-hero-copy">
            Skip the queue. Choose your print shop, upload your
            documents, select your print options, and get ready
            for convenient pickup.
          </p>

          <div className="xw-benefits">
            <span className="xw-benefit">
              <b>✓</b> Easy online ordering
            </span>
            <span className="xw-benefit">
              <b>✓</b> Secure checkout
            </span>
            <span className="xw-benefit">
              <b>✓</b> Local print shops
            </span>
          </div>

          <div
            className="xw-scene"
            aria-label="Illustration of a 3D printer"
          >
            <div className="xw-scene-glow" />

            <div className="xw-paper">
              <div className="xw-paper-logo">XW.</div>
              <div className="xw-paper-line long" />
              <div className="xw-paper-line" />
              <div className="xw-paper-line short" />

              <div className="xw-paper-chart">
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="xw-paper-line long" />
              <div className="xw-paper-line short" />
            </div>

            <div className="xw-printer">
              <div className="xw-printer-top" />
              <div className="xw-printer-slot" />
              <div className="xw-printer-front">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="xw-float-tag xw-tag-left">
              📄 Print ready
            </div>

            <div className="xw-float-tag xw-tag-right">
              ✦ Simple &amp; fast
            </div>
          </div>
        </section>

        <section className="xw-login-card">
          <div className="xw-card-icon">↗</div>

          <h2>Welcome back</h2>

          <p className="xw-card-subtitle">
            Sign in to order prints and manage your documents.
          </p>

          <form onSubmit={submit}>
            <div className="xw-field">
              <label htmlFor="xw-identifier">
                Mobile number or email
              </label>

              <input
                className="xw-input"
                id="xw-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter mobile number or email"
                autoComplete="username"
                required
              />
            </div>

            <div className="xw-field">
              <label htmlFor="xw-password">Password</label>

              <div className="xw-input-wrap">
                <input
                  className="xw-input xw-password-input"
                  id="xw-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  className="xw-show-password"
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              className="xw-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Signing in...'
                : 'Sign In to XeroxWala  →'}
            </button>
          </form>

          <div className="xw-divider">MORE OPTIONS</div>

          <div className="xw-link-list">
            <div className="xw-link-row">
              <span>New to XeroxWala?</span>
              <button
                type="button"
                onClick={() =>
                  onNavigate('customer-registration')
                }
              >
                Create account
              </button>
            </div>

            <div className="xw-link-row">
              <span>Just need a quick print?</span>
              <button
                type="button"
                onClick={() => onNavigate('guest')}
              >
                Continue as guest
              </button>
            </div>

            <div className="xw-link-row">
              <span>Manage a print shop?</span>
              <button
                type="button"
                onClick={() => onNavigate('owner-login')}
              >
                Owner login
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="xw-login-footer">
        <span>
          © 2026 XeroxWala · Making printing simpler.
        </span>

        <button
          className="xw-footer-admin"
          type="button"
          onClick={() => onNavigate('main-admin-login')}
        >
          🔐 Main Admin Login
        </button>
      </footer>

      {/* Login success popup */}
      {showSuccess && (
        <div
          className="xw-modal-overlay"
          role="presentation"
        >
          <div
            className="xw-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="xw-success-title"
          >
            <div className="xw-modal-icon">✓</div>

            <h2 id="xw-success-title">
              Login Successful!
            </h2>

            <p>
              Welcome back, <strong>{customerName}</strong>!
              <br />
              You are now signed in to XeroxWala.
            </p>

            <button
              className="xw-modal-primary"
              type="button"
              onClick={() => {
  setShowSuccess(false)
  onNavigate('customer-dashboard')
}}
            >
              Continue to Dashboard →
            </button>
          </div>
        </div>
      )}

      {/* Styled login error popup */}
      {errorMessage && (
        <div
          className="xw-modal-overlay"
          role="presentation"
        >
          <div
            className="xw-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="xw-error-title"
          >
            <div className="xw-modal-icon xw-error-icon">
              !
            </div>

            <h2 id="xw-error-title">Login Failed</h2>

            <p>{errorMessage}</p>

            <button
              className="xw-modal-primary"
              type="button"
              onClick={() => setErrorMessage('')}
            >
              Try Again
            </button>

            <button
              className="xw-modal-secondary"
              type="button"
              onClick={() => {
                setErrorMessage('')
                setPassword('')
              }}
            >
              Clear password
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
