import { useEffect, useState } from 'react'
import './App.css'
import Help from "./Help";
import ShopSelector from './ShopSelector'
import MyOrders from './MyOrders'
import ShopDashboard from './ShopDashboard'
import CustomerLogin from './CustomerLogin'
import CustomerRegistration from './CustomerRegistration'
import GuestPage from './GuestPage'
import ShopOwnerLogin from './ShopOwnerLogin'
import ShopOwnerRegistration from './ShopOwnerRegistration'
import MainAdminLogin from './MainAdminLogin'
import MainAdminDashboard from './MainAdminDashboard'
import CustomerDashboard from './CustomerDashboard'

import { loadRazorpayScript } from './razorpay'
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from './paymentService'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/$/, '')

function App() {
  const [showDashboard, setShowDashboard] = useState(() => {
  return Boolean(sessionStorage.getItem('xeroxwalaOwnerAuth'))
})
  
const [page, setPage] = useState(() => {
  try {
    // Owner dashboard uses xeroxwalaOwnerAuth.
    // This is the key your current login handler saves.
    if (sessionStorage.getItem('xeroxwalaOwnerAuth')) {
      return 'shop-dashboard'
    }

    const customer = JSON.parse(
      sessionStorage.getItem('xeroxwalaCustomer') || 'null'
    )

    if (customer?.customerId) {
      return 'customer-dashboard'
    }

    return 'customer-login'
  } catch {
    return 'customer-login'
  }
})


  const [ownerLogin, setOwnerLogin] = useState({
    username: '',
    password: '',
  })
  const [ownerLoginError, setOwnerLoginError] = useState('')
  const [ownerLoginBusy, setOwnerLoginBusy] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const [shops, setShops] = useState([])
  const [selectedShopId, setSelectedShopId] = useState('')
  const [shopsLoading, setShopsLoading] = useState(true)
  const [shopsError, setShopsError] = useState('')

  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [popupType, setPopupType] = useState('error')

  const [customerType, setCustomerType] = useState('REGISTERED')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [pickupAt, setPickupAt] = useState('')

  const [pages, setPages] = useState(1)
  const [copies, setCopies] = useState(1)
  const [colorMode, setColorMode] = useState('BLACK_WHITE')
  const [printSides, setPrintSides] = useState('SINGLE')
  const [documentFile, setDocumentFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function showErrorPopup(message, type = 'error') {
    setErrorMessage(message)
    setPopupType(type)
    setShowError(true)
  }

  function goTo(nextPage) {
    setPage(nextPage)
    setOwnerLoginError('')
    setProfileOpen(false)
  }

  function getCustomer() {
    try {
      return JSON.parse(
        sessionStorage.getItem('xeroxwalaCustomer') || 'null'
      )
    } catch {
      return null
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadShops() {
      setShopsLoading(true)
      setShopsError('')

      try {
        const response = await fetch(`${API_URL}/api/shops`)

        if (!response.ok) {
          throw new Error(
            `Could not load available shops (HTTP ${response.status}).`
          )
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error('The shops API did not return a list.')
        }

        const activeShops = data.filter(
          (shop) => shop.isActive !== false && shop.isActive !== 0
        )

        if (!cancelled) {
          setShops(activeShops)
          setSelectedShopId((currentId) => {
            const stillAvailable = activeShops.some(
              (shop) => String(shop.shopId) === String(currentId)
            )

            return stillAvailable && currentId !== ''
              ? currentId
              : ''
          })
        }
      } catch (error) {
        if (!cancelled) {
          setShopsError(
            error.message || 'Could not connect to the shop service.'
          )
        }
      } finally {
        if (!cancelled) {
          setShopsLoading(false)
        }
      }
    }

    loadShops()

    return () => {
      cancelled = true
    }
  }, [])

  const rate =
    colorMode === 'COLOR'
      ? printSides === 'SINGLE'
        ? 10
        : 15
      : printSides === 'SINGLE'
        ? 2
        : 3

  const sheets =
    printSides === 'DOUBLE' ? Math.ceil(pages / 2) : pages

  const total = sheets * copies * rate

  async function handleOwnerLogin(event) {
    event.preventDefault()
    setOwnerLoginError('')
    setOwnerLoginBusy(true)

    try {
      const username = ownerLogin.username.trim()
      const password = ownerLogin.password

      if (!username || !password) {
        throw new Error('Enter both username and password.')
      }

      const auth = btoa(`${username}:${password}`)

      const response = await fetch(
        `${API_URL}/api/orders/dashboard`,
        {
          method: 'GET',
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: 'application/json',
          },
        }
      )

      if (response.status === 401) {
        throw new Error(
          'Authentication failed. Check the owner username and password.'
        )
      }

      if (response.status === 403) {
        throw new Error(
          'Access forbidden. Check whether the owner account is enabled and has dashboard access.'
        )
      }

      if (response.status === 404) {
        throw new Error(
          'The dashboard endpoint was not found. Check the backend route /api/orders/dashboard.'
        )
      }

      if (!response.ok) {
        throw new Error(
          `Login request failed (HTTP ${response.status}).`
        )
      }
const data = await response.json()

sessionStorage.setItem('xeroxwalaOwnerAuth', auth)
sessionStorage.setItem(
  'xeroxwalaShopName',
  data.shopName || data.name || ownerLogin.username.trim()
)

setShowDashboard(true)
setPage('shop-dashboard')
      setShowDashboard(true)
    } catch (error) {
      setOwnerLoginError(
        error.message || 'Could not connect to the backend.'
      )
    } finally {
      setOwnerLoginBusy(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (shopsLoading) {
      showErrorPopup('Please wait while available shops are loading.')
      return
    }

    if (shopsError) {
      showErrorPopup('Could not load shops. Please try again later.')
      return
    }

    if (shops.length === 0) {
      showErrorPopup('No active shops are available right now.')
      return
    }

    const selectedShop = shops.find(
      (shop) => String(shop.shopId) === String(selectedShopId)
    )

    if (!selectedShop) {
      showErrorPopup('Please select a print shop before placing your order.')
      return
    }

    if (customerType === 'REGISTERED' && !pickupAt) {
      showErrorPopup(
        'Please select a pickup date and time for registered customers.'
      )
      return
    }

    if (
      customerType === 'GUEST' &&
      (!customerName.trim() || !customerPhone.trim())
    ) {
      showErrorPopup('Please enter your name and phone number.')
      return
    }

    if (pickupAt && new Date(pickupAt).getTime() <= Date.now()) {
      showErrorPopup('Please select a future pickup date and time.')
      return
    }

    if (!documentFile) {
      showErrorPopup('Please select a document first.')
      return
    }

    if (documentFile.size > 20 * 1024 * 1024) {
      showErrorPopup('File size must not exceed 20 MB.')
      return
    }

    setIsSubmitting(true)
    let createdOrder = null

    try {
      const orderPayload = {
        shopId: Number(selectedShop.shopId),
        pageCount: Number(pages),
        copies: Number(copies),
        colorMode,
        printSides,
      }

      if (customerType === 'REGISTERED') {
        const savedCustomer = sessionStorage.getItem(
          'xeroxwalaCustomer'
        )

        if (!savedCustomer) {
          showErrorPopup(
            'Please log in before placing a registered customer order.'
          )
          setPage('customer-login')
          return
        }

        let loggedInCustomer

        try {
          loggedInCustomer = JSON.parse(savedCustomer)
        } catch {
          sessionStorage.removeItem('xeroxwalaCustomer')
          showErrorPopup(
            'Your customer session is invalid. Please log in again.'
          )
          setPage('customer-login')
          return
        }

        if (!loggedInCustomer?.customerId) {
          sessionStorage.removeItem('xeroxwalaCustomer')
          showErrorPopup(
            'Customer details are missing. Please log in again.'
          )
          setPage('customer-login')
          return
        }

        orderPayload.customerId = loggedInCustomer.customerId
        orderPayload.pickupAt = pickupAt
      } else {
        orderPayload.guestName = customerName.trim()
        orderPayload.guestPhone = customerPhone.trim()

        if (pickupAt) {
          orderPayload.pickupAt = pickupAt
        }
      }

      const orderResponse = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      })

      let orderData

      try {
        orderData = await orderResponse.json()
      } catch {
        throw new Error('The server returned an invalid order response.')
      }

      if (!orderResponse.ok) {
        throw new Error(
          orderData.message || 'Could not create the order.'
        )
      }

      createdOrder = orderData

      const formData = new FormData()
      formData.append('file', documentFile)

      const uploadResponse = await fetch(
        `${API_URL}/api/orders/${orderData.orderId}/files`,
        {
          method: 'POST',
          body: formData,
        }
      )

      let uploadData = {}

      try {
        uploadData = await uploadResponse.json()
      } catch {
        // The upload endpoint may return an empty response.
      }

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData.message ||
            'The order was created, but document upload failed.'
        )
      }

      const scriptLoaded = await loadRazorpayScript()

      if (!scriptLoaded) {
        throw new Error(
          'Could not load Razorpay Checkout. Check your internet connection.'
        )
      }

      const paymentData = await createRazorpayOrder(orderData.orderId)

      if (
        !paymentData.razorpayKeyId ||
        !paymentData.razorpayOrderId ||
        paymentData.amount == null
      ) {
        throw new Error(
          'The backend returned incomplete Razorpay order details.'
        )
      }

      const amountInPaise = Math.round(
        Number(paymentData.amount) * 100
      )

      if (
        !Number.isFinite(amountInPaise) ||
        amountInPaise <= 0
      ) {
        throw new Error(
          'The backend returned an invalid payment amount.'
        )
      }

      await new Promise((resolve) => {
        let finished = false

        const finish = () => {
          if (!finished) {
            finished = true
            resolve()
          }
        }

        const checkout = new window.Razorpay({
          key: paymentData.razorpayKeyId,
          amount: amountInPaise,
          currency: paymentData.currency || 'INR',
          name: 'XeroxWala',
          description: `Print order ${orderData.orderNumber}`,
          order_id: paymentData.razorpayOrderId,

          handler: async (response) => {
            try {
              await verifyRazorpayPayment(response)

              showErrorPopup(
                `Payment verified successfully! Order number: ${orderData.orderNumber}. Shop: ${selectedShop.shopName}. Your payment has been verified by the server.`,
                'success'
              )
            } catch (verificationError) {
              showErrorPopup(
                `Payment verification could not be confirmed. Order number: ${orderData.orderNumber}. Order ID: ${orderData.orderId}. Reason: ${verificationError.message}. Do not pay again until you check the payment status.`
              )
            } finally {
              finish()
            }
          },

          modal: {
            ondismiss: () => {
              showErrorPopup(
                `Checkout was closed. Your order ${orderData.orderNumber} is saved, but payment has not been confirmed.`
              )
              finish()
            },
          },
        })

        checkout.on('payment.failed', (response) => {
          showErrorPopup(
            `Payment failed for order ${orderData.orderNumber}. Reason: ${
              response.error?.description ||
              'Payment was not completed.'
            } Your order is saved. Check its payment status before retrying.`
          )
          finish()
        })

        checkout.open()
      })
    } catch (error) {
      if (createdOrder) {
        showErrorPopup(
          `Your order ${createdOrder.orderNumber} was created, but a later step failed. Order ID: ${createdOrder.orderId}. Reason: ${error.message}. Your order may already exist. Check its status before submitting again.`
        )
      } else {
        showErrorPopup(
          `Order failed: ${error.message}. Check that the backend is running and the selected shop is active.`
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showDashboard) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setShowDashboard(false)
            setPage('customer-login')
            sessionStorage.removeItem('xeroxwalaOwnerAuth')
            setOwnerLogin({ username: '', password: '' })
          }}
          style={{
            margin: '16px',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          ← Back to Customer Page
        </button>

        <ShopDashboard />
      </div>
    )
  }

  const customer = getCustomer()

  if (page !== 'order') {
    if (page === 'help') {
  return <Help onNavigate={goTo} />
}
    if (page === 'my-orders') {
      return <MyOrders onNavigate={goTo} />
    }
    

    if (page === 'customer-dashboard') {
      return <CustomerDashboard onNavigate={goTo} />
    }

    if (page === 'customer-login') {
      return <CustomerLogin onNavigate={goTo} />
    }

    if (page === 'customer-registration') {
      return <CustomerRegistration onNavigate={goTo} />
    }

    if (page === 'guest') {
      return (
        <GuestPage
          onNavigate={goTo}
          onContinue={() => {
            setCustomerType('GUEST')
            setPage('order')
          }}
        />
      )
    }

    if (page === 'owner-login') {
      return (
        <ShopOwnerLogin
          onNavigate={goTo}
          username={ownerLogin.username}
          password={ownerLogin.password}
          setUsername={(username) =>
            setOwnerLogin((current) => ({
              ...current,
              username,
            }))
          }
          setPassword={(password) =>
            setOwnerLogin((current) => ({
              ...current,
              password,
            }))
          }
          onSubmit={handleOwnerLogin}
          error={ownerLoginError}
          busy={ownerLoginBusy}
        />
      )
    }

    if (page === 'owner-registration') {
      return <ShopOwnerRegistration onNavigate={goTo} />
    }

    if (page === 'main-admin-login') {
      return (
        <MainAdminLogin
          onBack={() => setPage('customer-login')}
          onLogin={(data) => {
            sessionStorage.setItem(
              'xeroxwalaAdminDashboard',
              JSON.stringify(data)
            )
            setPage('main-admin-dashboard')
          }}
        />
      )
    }

    if (page === 'main-admin-dashboard') {
      return (
        <MainAdminDashboard
          onBack={() => setPage('main-admin-login')}
        />
      )
    }

    // Safe fallback if an unknown page name is set.
    return <CustomerLogin onNavigate={goTo} />
  }

  return (
    <div className="app">
      <header className="navbar">
      
<a href="/" className="xeroxwala-brand">
  <img
    src="/xeroxwala-logo.png"
    alt="XeroxWala"
    className="xeroxwala-logo"
  />
</a>


        <nav>
  <a href="#home" onClick={() => goTo('order')}>Home</a>
  <a href="#services" onClick={() => goTo('order')}>Services</a>
  <a href="#order" onClick={() => goTo('order')}>Order Prints</a>
  <a
    href="#help"
    onClick={(event) => {
      event.preventDefault()
      goTo('help')
    }}
  >
    Help &amp; Support
  </a>
</nav>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            position: 'relative',
          }}
        >
          {!customer ? (
            <button
              type="button"
              className="login-btn"
              onClick={() => setPage('customer-login')}
            >
              Customer Login
            </button>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                aria-label="Open customer profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '24px',
                  padding: '8px 12px',
                  background: '#ffffff',
                  color: '#1e293b',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                <span>{customer.fullName || 'Customer'}</span>
                <span>👤</span>
              </button>

              {profileOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '260px',
                    padding: '18px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                    zIndex: 1000,
                    color: '#1e293b',
                  }}
                >
                  <h3>Customer Details</h3>
                  <p>
                    <strong>Name:</strong>{' '}
                    {customer.fullName || 'Not available'}
                  </p>
                  <p>
                    <strong>Phone:</strong>{' '}
                    {customer.phone || 'Not available'}
                  </p>
                  <p>
                    <strong>Email:</strong>{' '}
                    {customer.email || 'Not provided'}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem('xeroxwalaCustomer')
                      setProfileOpen(false)
                      setCustomerType('REGISTERED')
                      setCustomerName('')
                      setCustomerPhone('')
                      setPickupAt('')
                      setDocumentFile(null)
                      setPage('customer-login')
                    }}
                  >
                    Sign Out
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false)
                      setPage('my-orders')
                    }}
                  >
                    📋 My Orders
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">
              YOUR DOCUMENTS, OUR PRIORITY
            </span>

            <h1>
              Print smarter.
              <br />
              <span>Save your time.</span>
            </h1>

            <p>
              Upload your documents, choose your printing options,
              and order online. Convenient printing, ready for pickup.
            </p>

            <a className="primary-btn" href="#order">
              Start Printing <span>→</span>
            </a>

            <div className="hero-features">
              <span>✓ Easy online ordering</span>
              <span>✓ Black &amp; white or color</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-circle"></div>
            <div className="paper paper-back"></div>

            <div className="paper paper-front">
              <div className="paper-logo">XW</div>
              <div className="paper-line long"></div>
              <div className="paper-line"></div>
              <div className="paper-line short"></div>

              <div className="paper-chart">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="paper-line long"></div>
              <div className="paper-line short"></div>
            </div>

            <div className="printer">
              <div className="printer-top"></div>
              <div className="printer-slot"></div>

              <div className="printer-front">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <div className="floating-note">
              Print made simple ✦
            </div>
          </div>
        </section>

        <section className="services" id="services">
          <div className="section-heading">
            <span className="eyebrow">WHAT WE OFFER</span>
            <h2>Everything you need to print</h2>
            <p>
              Choose the printing service that works for you.
            </p>
          </div>

          <div className="service-grid">
            <article className="service-card">
              <div className="service-icon bw-icon">▤</div>
              <h3>Black &amp; White</h3>
              <p>
                Clear printing for notes, assignments and documents.
              </p>
              <div className="service-bottom">
                <strong>
                  From ₹2 <small>/ side</small>
                </strong>
                <span>01</span>
              </div>
            </article>

            <article className="service-card featured-card">
              <div className="service-icon color-icon">▧</div>
              <h3>Color Printing</h3>
              <p>
                Bring presentations, charts and projects to life.
              </p>
              <div className="service-bottom">
                <strong>
                  From ₹10 <small>/ side</small>
                </strong>
                <span>02</span>
              </div>
            </article>

            <article className="service-card">
              <div className="service-icon double-icon">▣</div>
              <h3>Double-Sided</h3>
              <p>
                Print on both sides to save paper and keep documents compact.
              </p>
              <div className="service-bottom">
                <strong>
                  From ₹3 <small>/ sheet</small>
                </strong>
                <span>03</span>
              </div>
            </article>
          </div>
        </section>

        <section className="order-section" id="order">
          <div className="order-intro">
            <span className="eyebrow">PLACE YOUR ORDER</span>
            <h2>Your prints, your way.</h2>
            <p>
              Select a print shop, choose a file and your print preferences
              to calculate the estimated price.
            </p>
            <div className="order-tip">
              📄 PDF, DOC, DOCX, PNG or JPG files · Maximum 20 MB
            </div>
          </div>

          <form className="order-form" onSubmit={handleSubmit}>
            <ShopSelector
              shops={shops}
              selectedShopId={selectedShopId}
              onSelectShop={setSelectedShopId}
              loading={shopsLoading}
              error={shopsError}
              onRetry={() => window.location.reload()}
              disabled={isSubmitting}
            />

            <label className="field-label" htmlFor="customerType">
              Customer type
            </label>

            <select
              id="customerType"
              value={customerType}
              onChange={(event) => setCustomerType(event.target.value)}
              disabled={isSubmitting}
            >
              {sessionStorage.getItem('xeroxwalaCustomer') ? (
                <option value="REGISTERED">Registered Customer</option>
              ) : (
                <option value="GUEST">Guest Customer</option>
              )}
            </select>

            {customerType === 'GUEST' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label className="field-label" htmlFor="customerName">
                    Full Name
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Enter your full name"
                    maxLength={100}
                    autoComplete="name"
                    required
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '12px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '15px',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="field-label" htmlFor="customerPhone">
                    Phone Number
                  </label>
                  <input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="Enter your mobile number"
                    maxLength={15}
                    autoComplete="tel"
                    required
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '12px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '15px',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </div>
              </>
            )}

            <label className="field-label" htmlFor="pickupAt">
              Pickup date and time{' '}
              {customerType === 'REGISTERED' ? '(Required)' : '(Optional)'}
            </label>

            <div style={{ marginBottom: '16px' }}>
              <input
                id="pickupAt"
                type="datetime-local"
                value={pickupAt}
                onChange={(event) => setPickupAt(event.target.value)}
                required={customerType === 'REGISTERED'}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '15px',
                  color: '#1e293b',
                  backgroundColor: isSubmitting ? '#f1f5f9' : '#ffffff',
                }}
              />
              <small
                style={{
                  display: 'block',
                  marginTop: '6px',
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                Choose a convenient date and time to collect your prints.
              </small>
            </div>

            <label className="field-label" htmlFor="document">
              Upload document
            </label>

            <input
              id="document"
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(event) =>
                setDocumentFile(event.target.files?.[0] ?? null)
              }
              required
              disabled={isSubmitting}
            />

            {documentFile && (
              <p className="selected-file">
                Selected: {documentFile.name}
              </p>
            )}

            <div className="form-row">
              <div className="form-field">
                <label className="field-label" htmlFor="pages">
                  Number of pages
                </label>
                <input
                  id="pages"
                  type="number"
                  min="1"
                  max="10000"
                  value={pages}
                  onChange={(event) =>
                    setPages(
                      Math.min(
                        10000,
                        Math.max(1, Number(event.target.value) || 1)
                      )
                    )
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-field">
                <label className="field-label" htmlFor="copies">
                  Number of copies
                </label>
                <input
                  id="copies"
                  type="number"
                  min="1"
                  max="100"
                  value={copies}
                  onChange={(event) =>
                    setCopies(
                      Math.min(
                        100,
                        Math.max(1, Number(event.target.value) || 1)
                      )
                    )
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <label className="field-label" htmlFor="colorMode">
              Print color
            </label>
            <select
              id="colorMode"
              value={colorMode}
              onChange={(event) => setColorMode(event.target.value)}
              disabled={isSubmitting}
            >
              <option value="BLACK_WHITE">Black &amp; White</option>
              <option value="COLOR">Color</option>
            </select>

            <label className="field-label" htmlFor="printSides">
              Print sides
            </label>
            <select
              id="printSides"
              value={printSides}
              onChange={(event) => setPrintSides(event.target.value)}
              disabled={isSubmitting}
            >
              <option value="SINGLE">Single-sided</option>
              <option value="DOUBLE">Double-sided</option>
            </select>

            <div className="price-summary">
              <div>
                <span>Estimated total</span>
                <small>
                  {pages} pages × {copies} {copies === 1 ? 'copy' : 'copies'} ·{' '}
                  {printSides === 'DOUBLE' ? 'Double-sided' : 'Single-sided'}
                </small>
              </div>
              <strong>₹{total.toFixed(2)}</strong>
            </div>

            <button
              className="primary-btn submit-btn"
              type="submit"
              disabled={
                isSubmitting ||
                shopsLoading ||
                Boolean(shopsError) ||
                shops.length === 0
              }
            >
              {isSubmitting
                ? 'Creating Order & Opening Payment...'
                : 'Create Order & Pay'}
              {!isSubmitting && <span> →</span>}
            </button>

            <p className="form-disclaimer">
              The backend calculates the final price. After your document
              uploads, Razorpay Checkout will open for payment. Registered
              customers must select a pickup time. Guest orders can be placed
              with your name and phone number.
            </p>
          </form>
        </section>
      </main>

      <footer className="footer">
        <a className="logo" href="#home">
          <span className="logo-icon">X</span>
          Xerox<span className="logo-highlight">Wala</span>
        </a>

        <p>
          Making document printing easier, one page at a time.
        </p>

        <span>© 2026 XeroxWala</span>

        <button
          type="button"
          className="admin-footer-link"
          onClick={() => setPage('main-admin-login')}
        >
          <span aria-hidden="true">🔐</span>
          Main Admin Login
        </button>
        
<div className="footer-developer">
  <span>Designed &amp; Developed by</span>
  <strong>Parmeshwar Abuj</strong>
  <a href="mailto:parmeshwarabuj219@gmail.com">
    parmeshwarabuj219@gmail.com
  </a>
</div>

      </footer>

      {showError && (
        <div
          className="error-overlay"
          onClick={() => setShowError(false)}
        >
          <div
            className={`error-modal ${
              popupType === 'success' ? 'success-modal' : ''
            }`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="error-title"
            aria-describedby="error-description"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="error-icon">
              {popupType === 'success' ? '✓' : '!'}
            </div>

            <h2 id="error-title">
              {popupType === 'success'
                ? 'Payment Successful'
                : 'Something went wrong'}
            </h2>

            <p id="error-description">{errorMessage}</p>

            <button
              type="button"
              className="error-button"
              onClick={() => setShowError(false)}
              autoFocus
            >
              {popupType === 'success' ? 'Continue' : 'Okay, got it'}
            </button>
          </div>
        </div>
      )}
      
{showError && (
  <div
    className="app-modal-overlay"
    onClick={() => setShowError(false)}
  >
    <section
      className="app-modal"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
      aria-describedby="app-modal-description"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="app-modal-icon" aria-hidden="true">
        !
      </div>

      <h2 id="app-modal-title">XeroxWala Notification</h2>

      <p
        id="app-modal-description"
        className="app-modal-message"
      >
        {errorMessage}
      </p>

      <button
        type="button"
        className="app-modal-close"
        onClick={() => setShowError(false)}
        autoFocus
      >
        Okay, Got It
      </button>
    </section>
  </div>
)}

    </div>
    
  )
}

export default App