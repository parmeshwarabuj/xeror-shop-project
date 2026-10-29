
import { useEffect, useState } from 'react'

const API_URL = 'http://localhost:8080/api/orders/customer/me'

const stages = [
  {
    label: 'Order Placed',
    description: 'Your print order has been received.',
  },
  {
    label: 'Printing in Progress',
    description: 'The shop is processing your documents.',
  },
  {
    label: 'Ready for Pickup',
    description: 'Your prints are ready to collect.',
  },
  {
    label: 'Order Collected',
    description: 'Your print order has been collected.',
  },
]

function getCurrentStage(orderStatus) {
  const status = String(orderStatus || 'PENDING').toUpperCase()

  if (['COLLECTED', 'COMPLETED'].includes(status)) return 3
  if (['READY_FOR_PICKUP', 'READY'].includes(status)) return 2
  if (['PROCESSING', 'PRINTING', 'IN_PROGRESS'].includes(status)) return 1

  return 0
}

function formatDate(value) {
  if (!value) return 'Not scheduled'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString()
}

function formatStatus(value) {
  return String(value || 'PENDING')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default function MyOrders({ onNavigate }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function loadOrders() {
      try {
        setError('')

        const response = await fetch(API_URL, {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        })

        const text = await response.text()
        let data = null

        try {
          data = text ? JSON.parse(text) : null
        } catch {
          data = null
        }

        if (response.status === 401) {
          throw new Error(
            'Your login session has expired. Please log in again.'
          )
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.detail ||
              `Could not load orders (HTTP ${response.status}).`
          )
        }

        if (active) {
          setOrders(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Could not connect to the server.')
        }
      } finally {
        if (active) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    }

    loadOrders()

    return () => {
      active = false
    }
  }, [reloadKey])

  const styles = {
    page: {
      minHeight: '100vh',
      background: '#f3f9fc',
      padding: '32px 20px 60px',
      color: '#172b4d',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },
    container: {
      maxWidth: '900px',
      width: '100%',
      margin: '0 auto',
    },
    back: {
      background: '#fff',
      border: '1px solid #d5e1ed',
      borderRadius: '10px',
      padding: '11px 16px',
      cursor: 'pointer',
      color: '#17365d',
      fontSize: '14px',
      marginBottom: 0,
    },
    card: {
      background: '#fff',
      border: '1px solid #e0eaf2',
      borderRadius: '18px',
      padding: '24px',
      marginBottom: '22px',
      boxShadow: '0 5px 18px rgba(31, 65, 100, 0.05)',
      boxSizing: 'border-box',
      overflowWrap: 'anywhere',
    },
    muted: {
      color: '#647b96',
      fontSize: '14px',
      lineHeight: 1.6,
    },
    infoBox: {
      borderRadius: '13px',
      padding: '16px',
      minWidth: 0,
      boxSizing: 'border-box',
    },
    label: {
      fontSize: '13px',
      color: '#536b86',
      marginBottom: '8px',
    },
    value: {
      fontSize: '15px',
      fontWeight: 700,
      overflowWrap: 'anywhere',
    },
  }

  function refreshOrders() {
    if (loading || refreshing) return

    setRefreshing(true)
    setReloadKey((previous) => previous + 1)
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '28px',
          }}
        >
          <button
            type="button"
            onClick={() => onNavigate?.('customer-dashboard')}
            style={styles.back}
          >
            🏠 Back to Dashboard
          </button>

          <button
            type="button"
            onClick={refreshOrders}
            disabled={loading || refreshing}
            style={{
              ...styles.back,
              background:
                loading || refreshing ? '#e2e8f0' : '#2563eb',
              color:
                loading || refreshing ? '#64748b' : '#ffffff',
              border: 'none',
              cursor:
                loading || refreshing ? 'not-allowed' : 'pointer',
            }}
          >
            {refreshing ? '↻ Refreshing...' : '↻ Refresh Orders'}
          </button>
        </div>

        <h1
          style={{
            fontSize: '30px',
            margin: '0 0 8px',
            color: '#172b4d',
          }}
        >
          My Orders
        </h1>

        <p style={{ ...styles.muted, marginBottom: '28px' }}>
          Track your print orders and see their current status.
        </p>

        {loading && (
          <section style={styles.card} role="status">
            Loading your orders...
          </section>
        )}

        {!loading && error && (
          <section style={styles.card} role="alert">
            <h2>Unable to load orders</h2>
            <p style={styles.muted}>{error}</p>

            {error.includes('session has expired') && (
              <button
                type="button"
                onClick={() => onNavigate?.('customer-login')}
                style={styles.back}
              >
                Go to customer login
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setLoading(true)
                setRefreshing(false)
                setReloadKey((previous) => previous + 1)
              }}
              style={{
                ...styles.back,
                marginLeft: '8px',
              }}
            >
              Try Again
            </button>
          </section>
        )}

        {!loading && !error && orders.length === 0 && (
          <section style={styles.card}>
            <h2>No orders yet</h2>
            <p style={styles.muted}>
              Your print orders will appear here after you place them.
            </p>

            <button
              type="button"
              onClick={() => onNavigate?.('order')}
              style={{
                ...styles.back,
                background: '#2563eb',
                color: '#fff',
                border: 'none',
              }}
            >
              Place Your First Order
            </button>
          </section>
        )}

        {!loading &&
          !error &&
          orders.map((order) => {
            const status = String(
              order.orderStatus || 'PENDING'
            ).toUpperCase()

            const isCancelled = status === 'CANCELLED'
            const currentStage = getCurrentStage(status)

            return (
              <article
                key={order.orderId}
                style={styles.card}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h2
                      style={{
                        fontSize: '21px',
                        margin: '0 0 8px',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      Track order #
                      {order.orderNumber || order.orderId}
                    </h2>

                    <p style={{ ...styles.muted, margin: 0 }}>
                      Order ID: {order.orderId}
                    </p>
                  </div>

                  <strong style={{ fontSize: '21px' }}>
                    ₹{Number(order.totalAmount || 0).toFixed(2)}
                  </strong>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                    gap: '12px',
                    margin: '24px 0 28px',
                  }}
                >
                  <div
                    style={{
                      ...styles.infoBox,
                      background: isCancelled
                        ? '#fee2e2'
                        : '#d9f6e4',
                    }}
                  >
                    <div style={styles.label}>Print status</div>
                    <div
                      style={{
                        ...styles.value,
                        color: isCancelled ? '#b91c1c' : '#172b4d',
                      }}
                    >
                      {formatStatus(status)}
                    </div>
                  </div>

                  <div
                    style={{
                      ...styles.infoBox,
                      background: '#d7f4fa',
                    }}
                  >
                    <div style={styles.label}>
                      Pickup date and time
                    </div>
                    <div style={styles.value}>
                      {formatDate(order.pickupAt)}
                    </div>
                  </div>

                  <div
                    style={{
                      ...styles.infoBox,
                      background: '#e8e7ff',
                    }}
                  >
                    <div style={styles.label}>Payment status</div>
                    <div style={styles.value}>
                      {formatStatus(order.paymentStatus)}
                    </div>
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: '17px',
                    marginBottom: '24px',
                  }}
                >
                  Tracking Details
                </h3>

                {isCancelled ? (
                  <div
                    role="status"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      padding: '18px',
                      borderRadius: '12px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#991b1b',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: '28px',
                        height: '28px',
                        flexShrink: 0,
                        borderRadius: '50%',
                        background: '#dc2626',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                      }}
                    >
                      ×
                    </span>

                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          marginBottom: '6px',
                        }}
                      >
                        Order Cancelled
                      </div>

                      <div
                        style={{
                          fontSize: '14px',
                          lineHeight: 1.5,
                        }}
                      >
                        This order has been cancelled and will not
                        proceed to printing or pickup.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ paddingLeft: '4px' }}>
                    {stages.map((stage, index) => {
                      const completed = index <= currentStage
                      const isCurrent = index === currentStage

                      return (
                        <div
                          key={stage.label}
                          style={{
                            display: 'flex',
                            gap: '14px',
                            minHeight:
                              index === stages.length - 1
                                ? '65px'
                                : '82px',
                          }}
                        >
                          <div
                            style={{
                              width: '22px',
                              flexShrink: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            <div
                              style={{
                                width: '20px',
                                height: '20px',
                                flexShrink: 0,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: completed
                                  ? '#22c55e'
                                  : '#fff',
                                color: completed
                                  ? '#fff'
                                  : '#94a3b8',
                                border: completed
                                  ? 'none'
                                  : '2px solid #cbd5e1',
                                fontSize: '12px',
                                fontWeight: 700,
                                boxSizing: 'border-box',
                              }}
                            >
                              {completed ? '✓' : ''}
                            </div>

                            {index < stages.length - 1 && (
                              <div
                                style={{
                                  width: '3px',
                                  flex: 1,
                                  minHeight: '35px',
                                  background:
                                    index < currentStage
                                      ? '#22c55e'
                                      : '#d1d5db',
                                }}
                              />
                            )}
                          </div>

                          <div style={{ paddingBottom: '20px' }}>
                            <div
                              style={{
                                fontWeight: isCurrent ? 700 : 500,
                                fontSize: '15px',
                                marginBottom: '6px',
                              }}
                            >
                              {stage.label}

                              {isCurrent && (
                                <span
                                  style={{
                                    marginLeft: '9px',
                                    color: '#2563eb',
                                    fontSize: '11px',
                                  }}
                                >
                                  CURRENT STATUS
                                </span>
                              )}
                            </div>

                            <div style={styles.muted}>
                              {stage.description}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div
                  style={{
                    borderTop: '1px solid #e6edf4',
                    paddingTop: '18px',
                    marginTop: '18px',
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(min(100%, 130px), 1fr))',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={styles.label}>Print settings</div>
                    <div style={styles.value}>
                      {String(order.colorMode || 'BLACK_WHITE')
                        .replaceAll('_', ' ')}
                      {' · '}
                      {String(order.printSides || 'SINGLE')
                        .replaceAll('_', ' ')}
                    </div>
                  </div>

                  <div>
                    <div style={styles.label}>Pages / copies</div>
                    <div style={styles.value}>
                      {order.pageCount ?? '—'} pages ·{' '}
                      {order.copies ?? '—'} copies
                    </div>
                  </div>
                </div>

                {status === 'PENDING' && (
                  <p
                    style={{
                      ...styles.muted,
                      marginTop: '18px',
                    }}
                  >
                    Your order has been received. The shop has not
                    yet marked it as processing.
                  </p>
                )}

                {isCancelled &&
                  String(order.paymentStatus || '').toUpperCase() ===
                    'PAID' && (
                    <p
                      style={{
                        ...styles.muted,
                        marginTop: '18px',
                      }}
                    >
                      This order shows as paid and cancelled. Please
                      contact the shop owner to confirm the applicable
                      refund or payment resolution.
                    </p>
                  )}
              </article>
            )
          })}
      </div>
    </main>
  )
}
