
import { useState } from 'react'
import './ShopOwnerLogin.css'

function Icon({ name, size = 20 }) {
  const icons = {
    back: <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
    next: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    eyeoff: <><path d="m3 3 18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.8" /><path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10.8 10.8 0 0 0 4-.8" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5" /></>,
    printer: <><path d="M6 9V3h12v6" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v7H6z" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 6-7" /><path d="M15 6h5v5" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2h6v2M8 9h8M8 13h8M8 17h5" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  )
}

export default function ShopOwnerLogin({
  onNavigate,
  username,
  password,
  setUsername,
  setPassword,
  onSubmit,
  error,
  busy,
}) {
  const [showPassword, setShowPassword] = useState(false)

  // Save the owner response after a successful login.
  // The parent onSubmit handler should save the response
  // before navigating to the owner dashboard.
  async function handleSubmit(event) {
    event.preventDefault()

    if (typeof onSubmit === 'function') {
      await onSubmit(event)
    }
  }

  return (
    <main className="owner-page">
      <header className="owner-topbar">
        <button
          className="owner-brand"
          type="button"
          onClick={() => onNavigate('customer-login')}
          aria-label="XeroxWala home"
        >
          <span className="owner-brand-mark">X</span>
          <span className="owner-brand-copy">
            <strong>XeroxWala</strong>
            <small>PRINT SMART. PRINT EASY.</small>
          </span>
        </button>

        <button
          className="owner-customer-link"
          type="button"
          onClick={() => onNavigate('customer-login')}
        >
          <Icon name="back" size={17} />
          Customer Login
        </button>
      </header>

      <section className="owner-hero">
        <div className="owner-left">
          <div className="owner-eyebrow">
            <Icon name="clipboard" size={19} />
            SHOP OWNER PORTAL
          </div>

          <h1>
            Manage Your Shop.
            <br />
            <span>Grow Your Business.</span>
          </h1>

          <p className="owner-intro">
            Track orders, manage customers, handle printing
            <br className="desktop-break" />
            requests and keep your shop running smoothly —
            <br className="desktop-break" />
            all in one place.
          </p>

          <div className="owner-feature customers">
            <Icon name="people" size={27} />
            <strong>Manage Customers</strong>
            <small>Keep your customers happy</small>
          </div>

          <div className="owner-feature orders">
            <Icon name="clipboard" size={27} />
            <strong>View Orders</strong>
            <small>Check new &amp; pending print orders</small>
          </div>

          <div className="owner-feature printing">
            <Icon name="printer" size={28} />
            <strong>Handle Printing</strong>
            <small>Track and process print requests</small>
          </div>

          <div className="owner-feature growth">
            <Icon name="chart" size={28} />
            <strong>Grow Faster</strong>
            <small>More orders, more profits</small>
          </div>

          <div className="owner-note">
            Your shop
            <br />
            matters <span>↗</span>
          </div>
        </div>

        <div className="owner-right">
          <section className="owner-card" aria-labelledby="owner-login-title">
            <div className="shop-art" aria-hidden="true">
              <div className="shop-cloud cloud-a" />
              <div className="shop-cloud cloud-b" />

              <div className="shop-building">
                <div className="shop-sign">SHOP OWNER</div>

                <div className="shop-awning">
                  <i /><i /><i /><i /><i /><i />
                </div>

                <div className="shop-windows">
                  <span />
                  <span />
                </div>

                <div className="shop-door" />
              </div>

              <b className="spark spark-a" />
              <b className="spark spark-b" />
              <b className="spark spark-c" />
            </div>

            <div className="owner-heading">
              <span className="lock-bubble">
                <Icon name="lock" size={30} />
              </span>
              <h2 id="owner-login-title">Shop Owner Login</h2>
            </div>

            <p className="owner-subtitle">
              Secure access for the shop owner to manage
              <br className="desktop-break" />
              orders and printing.
            </p>

            <form className="owner-form" onSubmit={handleSubmit}>
              <label htmlFor="owner-username">Owner username</label>

              <div className="owner-input">
                <span><Icon name="user" size={21} /></span>
                <input
                  id="owner-username"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  placeholder="Enter owner username"
                />
              </div>

              <label htmlFor="owner-password">Password</label>

              <div className="owner-input">
                <span><Icon name="lock" size={21} /></span>
                <input
                  id="owner-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="Enter your password"
                />

                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'eyeoff' : 'eye'} size={21} />
                </button>
              </div>

              {error && (
                <div className="owner-error" role="alert">
                  <span>!</span>
                  {error}
                </div>
              )}

              <button className="owner-submit" type="submit" disabled={busy}>
                {busy ? 'Checking credentials…' : 'Login to your shop'}
                {!busy && <Icon name="next" size={19} />}
              </button>
            </form>

            <div className="owner-secure">
              <Icon name="lock" size={15} />
              Secure access to your shop account
            </div>

            <div className="owner-register">
              <span>New shop owner?</span>
              <button
                type="button"
                onClick={() => onNavigate('owner-registration')}
              >
                Register your shop owner account
                <Icon name="next" size={15} />
              </button>
            </div>
          </section>
        </div>
      </section>

      <footer className="owner-benefits">
        <div className="owner-benefit">
          <span><Icon name="shield" size={28} /></span>
          <div>
            <strong>Secure Access</strong>
            <small>Your data is safe with us</small>
          </div>
        </div>

        <div className="owner-benefit">
          <span><Icon name="clock" size={28} /></span>
          <div>
            <strong>Real-Time Updates</strong>
            <small>Stay informed, always</small>
          </div>
        </div>

        <div className="owner-benefit">
          <span><Icon name="printer" size={28} /></span>
          <div>
            <strong>Better Management</strong>
            <small>Run your shop efficiently</small>
          </div>
        </div>

        <div className="owner-benefit">
          <span><Icon name="chart" size={28} /></span>
          <div>
            <strong>Business Growth</strong>
            <small>More orders, more success</small>
          </div>
        </div>
      </footer>
    </main>
  )
}
