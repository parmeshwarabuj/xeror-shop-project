
import { useState } from 'react'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/$/, '')

const colors = {
  navy: '#111b65',
  blue: '#2868f5',
  purple: '#7850ed',
  muted: '#6479a6',
  border: '#dce6ff',
}

const initialForm = {
  ownerName: '',
  shopName: '',
  address: '',
  shopPhone: '',
  ownerPhone: '',
  photoUrl: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  verificationCode: '',
}

const fieldDefinitions = [
  {
    name: 'ownerName',
    label: 'Owner full name',
    placeholder: 'Enter your full name',
    icon: 'user',
    required: true,
    maxLength: 100,
  },
  {
    name: 'shopName',
    label: 'Shop name',
    placeholder: 'e.g. Sri Sai Xerox & Prints',
    icon: 'shop',
    required: true,
    maxLength: 150,
  },
  {
    name: 'ownerPhone',
    label: 'Owner mobile number',
    placeholder: 'Enter mobile number',
    icon: 'phone',
    required: true,
    maxLength: 15,
  },
  {
    name: 'shopPhone',
    label: 'Shop phone number',
    placeholder: 'Enter shop contact number',
    icon: 'phone',
    maxLength: 15,
  },
  {
    name: 'email',
    label: 'Email address',
    placeholder: 'you@example.com',
    icon: 'mail',
    type: 'email',
    maxLength: 150,
  },
  {
    name: 'address',
    label: 'Shop address',
    placeholder: 'Street, area, city and PIN code',
    icon: 'pin',
    multiline: true,
    required: true,
    maxLength: 300,
  },
  {
    name: 'photoUrl',
    label: 'Shop photo URL',
    placeholder: 'https://example.com/shop.jpg',
    icon: 'shop',
    type: 'url',
    maxLength: 500,
  },
  {
    name: 'username',
    label: 'Create username',
    placeholder: 'Choose a username',
    icon: 'user',
    required: true,
    maxLength: 30,
  },
]

function Icon({ name, size = 20 }) {
  const paths = {
    shop: (
      <>
        <path d="M3 10h18l-2-7H5l-2 7Z" />
        <path d="M5 10v11h14V10M9 21v-7h6v7" />
        <path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    phone: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <path d="M11 18h2" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeoff: (
      <>
        <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10.8 10.8 0 0 0 4-.8" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    printer: (
      <>
        <path d="M6 9V3h12v6" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <path d="M6 14h12v7H6z" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 3 3 6-7" />
      </>
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function validateOwnerForm(form) {
  const ownerName = form.ownerName.trim()
  const shopName = form.shopName.trim()
  const ownerPhone = form.ownerPhone.trim()
  const shopPhone = form.shopPhone.trim()
  const email = form.email.trim()
  const address = form.address.trim()
  const photoUrl = form.photoUrl.trim()
  const username = form.username.trim()
  const password = form.password
  const verificationCode = form.verificationCode.trim()

  if (ownerName.length < 3) {
    return 'Owner name must contain at least 3 characters.'
  }

  if (!/^[\p{L}\p{M} .'-]+$/u.test(ownerName)) {
    return 'Owner name can contain only letters, spaces, dots, apostrophes and hyphens.'
  }

  if (shopName.length < 2) {
    return 'Shop name must contain at least 2 characters.'
  }

  const validIndianPhone = (phone) => {
    const normalized = phone.replace(/[\s()-]/g, '')

    return /^(?:\+91|91)?[6-9]\d{9}$/.test(normalized)
  }

  if (!validIndianPhone(ownerPhone)) {
    return 'Enter a valid Indian mobile number for the owner.'
  }

  if (shopPhone && !validIndianPhone(shopPhone)) {
    return 'Enter a valid Indian mobile number for the shop.'
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Enter a valid email address.'
  }

  if (address.length < 5) {
    return 'Please enter the complete shop address.'
  }

  if (photoUrl) {
    try {
      const url = new URL(photoUrl)

      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'Shop photo URL must use HTTP or HTTPS.'
      }
    } catch {
      return 'Enter a valid shop photo URL.'
    }
  }

  if (!/^[a-zA-Z0-9._-]{4,30}$/.test(username)) {
    return 'Username must be 4–30 characters. Use letters, numbers, dots, underscores or hyphens.'
  }

  if (password.length < 8) {
    return 'Password must contain at least 8 characters.'
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.'
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.'
  }

  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.'
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character.'
  }

  if (password !== form.confirmPassword) {
    return 'Passwords do not match.'
  }

  if (!verificationCode) {
    return 'Please enter the registration verification code.'
  }

  return ''
}

export default function ShopOwnerRegistration({ onNavigate }) {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showVerification, setShowVerification] = useState(false)

  function update(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    if (message) {
      setMessage('')
    }
  }

  async function submit(event) {
    event.preventDefault()
    setMessage('')
    setSuccess(false)

    const validationError = validateOwnerForm(form)

    if (validationError) {
      setMessage(validationError)
      return
    }

    setLoading(true)

    const requestBody = {
      ownerName: form.ownerName.trim(),
      shopName: form.shopName.trim(),
      address: form.address.trim(),
      shopPhone: form.shopPhone.trim(),
      ownerPhone: form.ownerPhone.trim(),
      photoUrl: form.photoUrl.trim() || null,
      email: form.email.trim() || null,
      username: form.username.trim(),
      password: form.password,
      verificationCode: form.verificationCode.trim(),
    }

    try {
      const response = await fetch(`${API_URL}/api/owner-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const responseText = await response.text()
      let data = {}

      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch {
        data = { message: responseText }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Registration failed (${response.status}).`
        )
      }

      setSuccess(true)
      setMessage(
        data.message ||
          'Registration submitted. Please wait for administrator approval.'
      )

      setForm(initialForm)
    } catch (error) {
      setMessage(
        error.message ||
          'Could not connect to the server. Please check that it is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    minWidth: 0,
    border: 0,
    outline: 0,
    background: 'transparent',
    color: colors.navy,
    fontSize: 14,
    padding: '13px 0',
    fontFamily: 'inherit',
  }

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 750,
    color: '#344b80',
    marginBottom: 7,
  }

  function renderField(field) {
    return (
      <div key={field.name} style={{ minWidth: 0 }}>
        <label htmlFor={`owner-${field.name}`} style={labelStyle}>
          {field.label}
          {field.required ? ' *' : ' (optional)'}
        </label>

        <div
          className="owner-reg-field"
          style={{
            display: 'flex',
            alignItems: field.multiline ? 'flex-start' : 'center',
            gap: 10,
            padding: '0 13px',
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            background: '#fff',
            boxShadow: '0 3px 9px #3d63ba08',
            transition: 'border-color .2s, box-shadow .2s',
          }}
        >
          <span
            style={{
              color: '#6581ba',
              paddingTop: field.multiline ? 13 : 0,
            }}
          >
            <Icon name={field.icon} size={18} />
          </span>

          {field.multiline ? (
            <textarea
              id={`owner-${field.name}`}
              name={field.name}
              value={form[field.name]}
              onChange={update}
              placeholder={field.placeholder}
              rows={3}
              required={field.required}
              maxLength={field.maxLength}
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          ) : (
            <input
              id={`owner-${field.name}`}
              name={field.name}
              type={field.type || 'text'}
              value={form[field.name]}
              onChange={update}
              placeholder={field.placeholder}
              required={field.required}
              maxLength={field.maxLength}
              autoComplete={
                field.name === 'username'
                  ? 'username'
                  : field.name === 'email'
                    ? 'email'
                    : 'off'
              }
              style={inputStyle}
            />
          )}
        </div>
      </div>
    )
  }

  function renderPassword(name, label, value, visible, toggle) {
    return (
      <div key={name}>
        <label htmlFor={`owner-${name}`} style={labelStyle}>
          {label} *
        </label>

        <div
          className="owner-reg-field"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 13px',
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            background: '#fff',
          }}
        >
          <span style={{ color: '#6581ba' }}>
            <Icon name="lock" size={18} />
          </span>

          <input
            id={`owner-${name}`}
            name={name}
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={update}
            required
            minLength={8}
            autoComplete="new-password"
            maxLength={128}
            placeholder={
              name === 'password'
                ? 'Minimum 8 characters'
                : 'Re-enter your password'
            }
            style={inputStyle}
          />

          <button
            type="button"
            onClick={toggle}
            aria-label={visible ? 'Hide password' : 'Show password'}
            style={{
              border: 0,
              background: 'transparent',
              color: '#7387af',
              padding: 4,
              cursor: 'pointer',
            }}
          >
            <Icon name={visible ? 'eyeoff' : 'eye'} size={19} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        color: colors.navy,
        fontFamily:
          'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
        background: '#f4f7ff',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes xeroxFloat {
          0%,100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-9px) rotate(1deg); }
        }

        @keyframes xeroxGlow {
          0%,100% { opacity: .45; transform: scale(.96); }
          50% { opacity: .8; transform: scale(1.04); }
        }

        .owner-reg-field:focus-within {
          border-color: #7290ff !important;
          box-shadow: 0 0 0 4px #4268f015 !important;
        }

        .owner-reg-link:hover {
          text-decoration: underline;
        }

        .owner-reg-submit:hover:not(:disabled) {
          filter: brightness(1.06);
          transform: translateY(-2px);
          box-shadow: 0 12px 25px #536af24c;
        }

        .owner-reg-submit:disabled {
          opacity: .7;
          cursor: wait;
        }

        @media (max-width: 900px) {
          .owner-reg-layout {
            grid-template-columns: 1fr !important;
          }

          .owner-reg-visual {
            min-height: 420px !important;
          }

          .owner-reg-visual h1 {
            font-size: 38px !important;
          }

          .owner-reg-visual .owner-reg-decor {
            display: none !important;
          }

          .owner-reg-benefits {
            grid-template-columns: repeat(2,minmax(0,1fr)) !important;
          }
        }

        @media (max-width: 520px) {
          .owner-reg-header {
            padding: 14px 16px !important;
          }

          .owner-reg-header-title {
            font-size: 23px !important;
          }

          .owner-reg-layout {
            padding: 18px 12px 28px !important;
          }

          .owner-reg-visual {
            min-height: 350px !important;
            padding: 24px 20px !important;
          }

          .owner-reg-visual h1 {
            font-size: 32px !important;
          }

          .owner-reg-grid {
            grid-template-columns: 1fr !important;
          }

          .owner-reg-card {
            padding: 22px 17px !important;
          }

          .owner-reg-benefits {
            padding: 18px 12px !important;
            gap: 16px !important;
          }
        }
      `}</style>

      <header
        className="owner-reg-header"
        style={{
          minHeight: 86,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 15,
          padding: '13px clamp(20px, 5vw, 68px)',
          background: '#fff',
          borderBottom: '1px solid #e7edff',
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate('customer-login')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            border: 0,
            background: 'transparent',
            color: colors.navy,
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              width: 52,
              height: 52,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 15,
              color: '#fff',
              fontWeight: 950,
              fontSize: 38,
              background: 'linear-gradient(135deg,#2871f7,#8050ed)',
              boxShadow: '0 7px 16px #456bf02e',
            }}
          >
            X
          </span>

          <span>
            <strong
              className="owner-reg-header-title"
              style={{
                display: 'block',
                fontSize: 29,
                letterSpacing: -1.1,
                fontWeight: 900,
                lineHeight: 1.1,
              }}
            >
              XeroxWala
            </strong>
            <small
              style={{
                display: 'block',
                color: '#6380b7',
                fontSize: 9,
                letterSpacing: 1.5,
                fontWeight: 800,
              }}
            >
              PRINT SMART. PRINT EASY.
            </small>
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('owner-login')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 15px',
            border: '1px solid #c7d8ff',
            borderRadius: 12,
            color: '#2859db',
            background: '#fff',
            fontSize: 13,
            fontWeight: 750,
            cursor: 'pointer',
          }}
        >
          Already registered? Login <Icon name="arrow" size={16} />
        </button>
      </header>

      <section
        className="owner-reg-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px,.82fr) minmax(440px,1.18fr)',
          gap: 28,
          padding: '32px clamp(16px, 4vw, 58px) 38px',
          background:
            'radial-gradient(ellipse at 8% 20%,#dce7ff 0,transparent 45%),linear-gradient(120deg,#f5f8ff,#e9efff)',
        }}
      >
        <aside
          className="owner-reg-visual"
          style={{
            position: 'relative',
            minHeight: 800,
            padding: '38px 30px',
            borderRadius: 26,
            overflow: 'hidden',
            background:
              'linear-gradient(145deg,#1d5de7 0%,#4b4de6 58%,#8050ee 100%)',
            color: '#fff',
            boxShadow: '0 22px 50px #3659ce30',
            alignSelf: 'stretch',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 310,
              height: 310,
              borderRadius: '50%',
              right: -110,
              top: -75,
              background: '#ffffff12',
            }}
          />

          <div
            style={{
              position: 'absolute',
              width: 250,
              height: 250,
              borderRadius: '50%',
              left: -100,
              bottom: 50,
              background: '#b2ccff18',
            }}
          />

          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              padding: '9px 13px',
              border: '1px solid #ffffff40',
              borderRadius: 30,
              background: '#ffffff15',
              fontSize: 11,
              fontWeight: 850,
              letterSpacing: 1,
            }}
          >
            <Icon name="shop" size={17} /> JOIN THE XEROXWALA NETWORK
          </div>

          <h1
            style={{
              position: 'relative',
              margin: '24px 0 14px',
              fontSize: 'clamp(34px,3.5vw,47px)',
              lineHeight: 1.08,
              letterSpacing: -1.5,
              fontWeight: 900,
            }}
          >
            Bring Your Shop
            <br />
            <span style={{ color: '#d7e5ff' }}>Online.</span>
            <br />
            Grow With Us.
          </h1>

          <p
            style={{
              position: 'relative',
              maxWidth: 380,
              margin: 0,
              color: '#e1eaff',
              fontSize: 14,
              lineHeight: 1.8,
            }}
          >
            Create your shop owner account to manage printing orders,
            serve customers and grow your business with XeroxWala.
          </p>

          <div
            style={{
              position: 'relative',
              height: 300,
              marginTop: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              perspective: 900,
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 270,
                height: 225,
                borderRadius: '50%',
                background: '#b3d2ff26',
                filter: 'blur(1px)',
                animation: 'xeroxGlow 5s ease-in-out infinite',
              }}
            />

            <div
              style={{
                position: 'relative',
                width: 245,
                height: 225,
                transform: 'rotateY(-12deg) rotateX(4deg)',
                transformStyle: 'preserve-3d',
                animation: 'xeroxFloat 5s ease-in-out infinite',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 28,
                  top: 16,
                  width: 185,
                  height: 150,
                  borderRadius: 16,
                  background: 'linear-gradient(145deg,#fff,#dce7ff)',
                  border: '3px solid #c5d9ff',
                  boxShadow: '12px 17px 0 #183b9c55',
                }}
              >
                <div
                  style={{
                    margin: '17px auto 0',
                    width: 150,
                    height: 15,
                    borderRadius: 5,
                    background: 'linear-gradient(90deg,#3477ed,#7e6bf6)',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 15,
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 43,
                        height: 70,
                        borderRadius: 6,
                        background: i === 1 ? '#b9d5ff' : '#eaf1ff',
                        border: '2px solid #8eaff3',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div
                style={{
                  position: 'absolute',
                  left: 4,
                  bottom: 10,
                  width: 225,
                  height: 100,
                  borderRadius: 14,
                  background: 'linear-gradient(145deg,#ffffff,#c9d9ff)',
                  border: '3px solid #a9c4ff',
                  boxShadow: '15px 17px 0 #183b9c55',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 20,
                    top: 14,
                    width: 180,
                    height: 18,
                    borderRadius: 5,
                    background: '#203b85',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 30,
                    top: 19,
                    width: 160,
                    height: 8,
                    borderRadius: 3,
                    background: '#7bd7ff',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 50,
                    bottom: 10,
                    width: 125,
                    height: 35,
                    borderRadius: '0 0 6px 6px',
                    background: 'linear-gradient(180deg,#b8cfff,#f4f7ff)',
                    border: '2px solid #9bb9f6',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 18,
                    bottom: 20,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#37d5a0',
                    boxShadow: '0 0 12px #37d5a0',
                  }}
                />
              </div>

              <div
                style={{
                  position: 'absolute',
                  right: -17,
                  top: 78,
                  width: 52,
                  height: 65,
                  background: 'linear-gradient(135deg,#ffe5b0,#f5ae54)',
                  borderRadius: '8px 8px 4px 4px',
                  transform: 'rotate(8deg)',
                  border: '2px solid #fff1d2',
                  boxShadow: '4px 7px 0 #193e9a4d',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: 4,
                      margin: i === 0 ? '13px 7px 0' : '7px 7px 0',
                      background: '#dc8a36',
                      borderRadius: 3,
                    }}
                  />
                ))}
              </div>
            </div>

            <div
              className="owner-reg-decor"
              style={{
                position: 'absolute',
                left: -4,
                top: 35,
                padding: '12px 15px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: colors.navy,
                background: '#fff',
                borderRadius: 14,
                boxShadow: '0 12px 30px #132c8540',
                transform: 'rotate(-5deg)',
              }}
            >
              <Icon name="printer" size={24} />
              <span>
                <strong style={{ display: 'block', fontSize: 12 }}>
                  Print Orders
                </strong>
                <small style={{ color: '#7387ad', fontSize: 10 }}>
                  All in one place
                </small>
              </span>
            </div>

            <div
              className="owner-reg-decor"
              style={{
                position: 'absolute',
                right: -8,
                bottom: 22,
                padding: '12px 15px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: colors.navy,
                background: '#fff',
                borderRadius: 14,
                boxShadow: '0 12px 30px #132c8540',
                transform: 'rotate(4deg)',
              }}
            >
              <Icon name="chart" size={24} />
              <span>
                <strong style={{ display: 'block', fontSize: 12 }}>
                  Grow Your Shop
                </strong>
                <small style={{ color: '#7387ad', fontSize: 10 }}>
                  Build your business
                </small>
              </span>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              marginTop: 10,
              paddingTop: 22,
              borderTop: '1px solid #ffffff35',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '19px 12px',
            }}
          >
            {[
              ['printer', 'Manage print orders'],
              ['user', 'Serve more customers'],
              ['chart', 'Track your growth'],
              ['shield', 'Protected account'],
            ].map(([icon, text]) => (
              <div
                key={text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  fontSize: 12,
                  color: '#f0f4ff',
                }}
              >
                <span style={{ color: '#d2e4ff' }}>
                  <Icon name={icon} size={19} />
                </span>
                {text}
              </div>
            ))}
          </div>
        </aside>

        <section
          className="owner-reg-card"
          style={{
            minWidth: 0,
            alignSelf: 'start',
            padding: '29px clamp(18px,3vw,38px)',
            background: '#fff',
            border: '1px solid #e7edff',
            borderRadius: 24,
            boxShadow: '0 20px 55px #385dc218',
          }}
        >
          {success ? (
            <div
              role="status"
              style={{
                textAlign: 'center',
                padding: '35px 5px',
              }}
            >
              <div
                style={{
                  width: 82,
                  height: 82,
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#07966a',
                  background: '#d9fbed',
                  boxShadow: '0 10px 25px #0aa77620',
                }}
              >
                <Icon name="shield" size={42} />
              </div>

              <h2
                style={{
                  fontSize: 28,
                  margin: '0 0 12px',
                  color: colors.navy,
                }}
              >
                Registration submitted!
              </h2>

              <p style={{ color: colors.muted, lineHeight: 1.7 }}>
                {message}
              </p>

              <p style={{ color: colors.muted, lineHeight: 1.7 }}>
                Your shop may need administrator approval before owner login
                is enabled.
              </p>

              <button
                type="button"
                onClick={() => onNavigate('owner-login')}
                style={{
                  width: '100%',
                  marginTop: 15,
                  padding: 15,
                  border: 0,
                  borderRadius: 12,
                  color: '#fff',
                  background: `linear-gradient(100deg,${colors.blue},${colors.purple})`,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Go to Owner Login <Icon name="arrow" size={17} />
              </button>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 30,
                  color: '#3556d9',
                  background: '#edf1ff',
                  fontSize: 11,
                  fontWeight: 850,
                  letterSpacing: 0.6,
                }}
              >
                <Icon name="shop" size={16} /> SHOP OWNER PORTAL
              </div>

              <h2
                style={{
                  margin: '17px 0 8px',
                  fontSize: 'clamp(25px,2.5vw,32px)',
                  letterSpacing: -1,
                  lineHeight: 1.15,
                  color: colors.navy,
                  fontWeight: 900,
                }}
              >
                Register Your Shop
              </h2>

              <p
                style={{
                  color: colors.muted,
                  fontSize: 13,
                  lineHeight: 1.7,
                  margin: '0 0 23px',
                }}
              >
                Tell us about your shop and create your secure owner account.
              </p>

              <form onSubmit={submit} noValidate>
                <h3
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    color: '#2b4a91',
                    fontSize: 13,
                    margin: '0 0 15px',
                    paddingBottom: 11,
                    borderBottom: '1px solid #edf1ff',
                  }}
                >
                  <span
                    style={{
                      width: 27,
                      height: 27,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 8,
                      background: '#edf2ff',
                      color: colors.blue,
                    }}
                  >
                    <Icon name="shop" size={16} />
                  </span>
                  Shop &amp; Owner Details
                </h3>

                <div
                  className="owner-reg-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
                    gap: '16px 14px',
                  }}
                >
                  {fieldDefinitions.slice(0, 4).map(renderField)}
                </div>

                <div style={{ marginTop: 16 }}>
                  {renderField(fieldDefinitions[4])}
                </div>

                <div style={{ marginTop: 16 }}>
                  {renderField(fieldDefinitions[5])}
                </div>

                <div style={{ marginTop: 16 }}>
                  {renderField(fieldDefinitions[6])}
                </div>

                <h3
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    color: '#2b4a91',
                    fontSize: 13,
                    margin: '24px 0 15px',
                    paddingBottom: 11,
                    borderBottom: '1px solid #edf1ff',
                  }}
                >
                  <span
                    style={{
                      width: 27,
                      height: 27,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 8,
                      background: '#edf2ff',
                      color: colors.purple,
                    }}
                  >
                    <Icon name="lock" size={16} />
                  </span>
                  Login Credentials
                </h3>

                <div style={{ display: 'grid', gap: 16 }}>
                  {renderField(fieldDefinitions[7])}

                  {renderPassword(
                    'password',
                    'Create password',
                    form.password,
                    showPassword,
                    () => setShowPassword((value) => !value)
                  )}

                  <p
                    style={{
                      margin: '-8px 0 0',
                      color: colors.muted,
                      fontSize: 11,
                      lineHeight: 1.6,
                    }}
                  >
                    Use at least 8 characters, including uppercase and
                    lowercase letters, a number and a special character.
                  </p>

                  {renderPassword(
                    'confirmPassword',
                    'Confirm password',
                    form.confirmPassword,
                    showConfirmPassword,
                    () => setShowConfirmPassword((value) => !value)
                  )}

                  <div>
                    <label
                      htmlFor="owner-verificationCode"
                      style={labelStyle}
                    >
                      Registration verification code *
                    </label>

                    <div
                      className="owner-reg-field"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '0 13px',
                        border: `1px solid ${colors.border}`,
                        borderRadius: 12,
                        background: '#fff',
                      }}
                    >
                      <span style={{ color: '#6581ba' }}>
                        <Icon name="shield" size={18} />
                      </span>

                      <input
                        id="owner-verificationCode"
                        name="verificationCode"
                        type={showVerification ? 'text' : 'password'}
                        value={form.verificationCode}
                        onChange={update}
                        required
                        autoComplete="off"
                        maxLength={100}
                        placeholder="Enter registration code"
                        style={inputStyle}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowVerification((value) => !value)
                        }
                        aria-label={
                          showVerification
                            ? 'Hide verification code'
                            : 'Show verification code'
                        }
                        style={{
                          border: 0,
                          background: 'transparent',
                          color: '#7387af',
                          padding: 4,
                          cursor: 'pointer',
                        }}
                      >
                        <Icon
                          name={showVerification ? 'eyeoff' : 'eye'}
                          size={19}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {message && (
                  <div
                    role="alert"
                    aria-live="polite"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      color: '#b42335',
                      background: '#fff0f1',
                      border: '1px solid #ffd9dd',
                      padding: 13,
                      borderRadius: 11,
                      fontSize: 12,
                      lineHeight: 1.5,
                      marginTop: 18,
                    }}
                  >
                    <strong
                      style={{
                        width: 19,
                        height: 19,
                        flex: '0 0 19px',
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: '50%',
                        color: '#fff',
                        background: '#df4052',
                      }}
                    >
                      !
                    </strong>
                    <span>{message}</span>
                  </div>
                )}

                <p
                  style={{
                    color: '#8293b2',
                    fontSize: 11,
                    lineHeight: 1.6,
                    margin: '18px 0',
                  }}
                >
                  By submitting, you request an owner account. Your account
                  may require administrator approval before login is enabled.
                </p>

                <button
                  className="owner-reg-submit"
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    minHeight: 52,
                    border: 0,
                    borderRadius: 13,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 850,
                    background: `linear-gradient(100deg,${colors.blue},${colors.purple})`,
                    boxShadow: '0 8px 19px #536af233',
                    transition: 'transform .2s,box-shadow .2s,filter .2s',
                    cursor: loading ? 'wait' : 'pointer',
                  }}
                >
                  {loading ? 'Submitting registration…' : 'Submit Registration'}
                  {!loading && <Icon name="arrow" size={19} />}
                </button>
              </form>
            </>
          )}

          <div
            style={{
              marginTop: 22,
              paddingTop: 17,
              borderTop: '1px solid #edf1ff',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              color: '#788aaf',
              fontSize: 12,
            }}
          >
            Already have an owner account?

            <button
              className="owner-reg-link"
              type="button"
              onClick={() => onNavigate('owner-login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                border: 0,
                padding: 0,
                background: 'transparent',
                color: '#4350df',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Login here <Icon name="arrow" size={15} />
            </button>
          </div>
        </section>
      </section>

      <footer
        className="owner-reg-benefits"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
          gap: 20,
          padding: '24px clamp(20px,5vw,68px)',
          background: '#fff',
          borderTop: '1px solid #e4ebff',
        }}
      >
        {[
          ['shield', 'Secure Registration', 'Your account details stay protected'],
          ['printer', 'Print Order Management', 'Organize incoming print jobs'],
          ['user', 'Customer Connections', 'Keep customer requests organized'],
          ['chart', 'Business Growth', 'Build your shop online'],
        ].map(([icon, title, text]) => (
          <div
            key={title}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span
              style={{
                width: 47,
                height: 47,
                flex: '0 0 47px',
                display: 'grid',
                placeItems: 'center',
                borderRadius: 15,
                color: colors.blue,
                background: '#edf2ff',
                border: '1px solid #d9e4ff',
              }}
            >
              <Icon name={icon} size={23} />
            </span>

            <span>
              <strong
                style={{
                  display: 'block',
                  fontSize: 12,
                  color: '#31518d',
                }}
              >
                {title}
              </strong>

              <small
                style={{
                  display: 'block',
                  marginTop: 4,
                  color: '#8092b3',
                  fontSize: 10,
                  lineHeight: 1.5,
                }}
              >
                {text}
              </small>
            </span>
          </div>
        ))}
      </footer>
    </main>
  )
}
