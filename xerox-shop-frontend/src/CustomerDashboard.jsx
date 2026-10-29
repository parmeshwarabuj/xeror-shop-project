
import { useState } from 'react'

const services = [
  {
    icon: '📄',
    title: 'Black & White Print',
    desc: 'Affordable everyday printing',
    color: '#e8edff',
  },
  {
    icon: '🌈',
    title: 'Colour Print',
    desc: 'Bright, high-quality prints',
    color: '#f2e8ff',
  },
  {
    icon: '📚',
    title: 'Project & Binding',
    desc: 'Projects, reports and assignments',
    color: '#e0f7f0',
  },
  {
    icon: '🪪',
    title: 'Photo & Documents',
    desc: 'ID photos and document copies',
    color: '#fff0dc',
  },
]

export default function CustomerDashboard({ onNavigate }) {
  const [search, setSearch] = useState('')

  const filteredServices = services.filter((item) =>
    `${item.title} ${item.desc}`
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  )

  function signOut() {
    sessionStorage.removeItem('xeroxwalaCustomer')
    onNavigate?.('customer-login')
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button
          type="button"
          style={styles.brand}
          onClick={() =>
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
          aria-label="XeroxWala home"
        >
          <span style={styles.logo}>X</span>
          <span>
            Xerox<span style={{ color: '#7c5cff' }}>Wala</span>
          </span>
        </button>

        <nav style={styles.nav} aria-label="Customer navigation">
          <button
            type="button"
            style={styles.navButton}
            onClick={() => onNavigate?.('my-orders')}
          >
            My Orders
          </button>

          <button
            type="button"
            style={styles.profileButton}
            onClick={signOut}
          >
            <span aria-hidden="true">👤</span>
            Sign Out
          </button>
        </nav>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.heroText}>
            <div style={styles.eyebrow}>
              YOUR LOCAL PRINTING PARTNER
            </div>

            <h1 style={styles.heroTitle}>
              Print it. Pick it up.
              <br />
              <span style={styles.gradientText}>
                Make life easier.
              </span>
            </h1>

            <p style={styles.heroDescription}>
              Upload your documents, choose your printing options,
              and order from a nearby Xerox shop.
            </p>

            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => onNavigate?.('order')}
            >
              Start a Print Order <span aria-hidden="true">→</span>
            </button>

            <div style={styles.trust}>
              <span style={styles.check}>✓</span>
              Simple ordering
              <span style={styles.check}>✓</span>
              Local print shops
            </div>
          </div>

          <div style={styles.visualArea}>
            <div style={styles.orbit} />

            <div style={styles.floatCard}>
              <span style={styles.floatIcon}>📄</span>
              <div>
                <b style={styles.floatTitle}>Documents ready</b>
                <small style={styles.floatSubtitle}>
                  Print quality: High
                </small>
              </div>
            </div>

            <div style={styles.printer}>
              <div style={styles.printerTop}>
                <div style={styles.paper}>
                  <div style={styles.paperLine} />
                  <div style={styles.paperLine} />
                  <div style={styles.paperLineShort} />
                </div>
              </div>

              <div style={styles.printerBody}>
                <div style={styles.printerScreen}>
                  <span />
                </div>
                <div style={styles.printerSlot} />
                <div style={styles.printerTray}>
                  <div style={styles.trayPaper} />
                </div>
              </div>

              <div style={styles.printerBase} />
            </div>

            <div style={styles.readyCard}>
              <span style={styles.readyIcon}>✓</span>
              <span>
                <b style={styles.readyTitle}>Ready when you are</b>
                <small style={styles.readySubtitle}>
                  Start your order today
                </small>
              </span>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeading}>
            <div>
              <span style={styles.kicker}>OUR SERVICES</span>
              <h2 style={styles.sectionTitle}>
                What would you like to print?
              </h2>
            </div>

            <span style={styles.sectionNote}>
              Choose a service to get started
            </span>
          </div>

          <label style={styles.searchWrap}>
            <span aria-hidden="true">🔎</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search printing services..."
              aria-label="Search printing services"
              style={styles.searchInput}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={styles.clearSearch}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>

          <div style={styles.services}>
            {filteredServices.map((item) => (
              <button
                type="button"
                key={item.title}
                style={styles.serviceCard}
                onClick={() => onNavigate?.('order')}
              >
                <span
                  style={{
                    ...styles.serviceIcon,
                    background: item.color,
                  }}
                >
                  {item.icon}
                </span>

                <b style={styles.serviceTitle}>{item.title}</b>

                <span style={styles.serviceDesc}>{item.desc}</span>

                <span style={styles.cardArrow} aria-hidden="true">
                  ↗
                </span>
              </button>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div style={styles.noResults}>
              <span style={{ fontSize: 28 }}>🔎</span>
              <b>No services found</b>
              <span style={styles.serviceDesc}>
                Try searching for printing, colour, documents, or binding.
              </span>
              <button
                type="button"
                style={styles.resetButton}
                onClick={() => setSearch('')}
              >
                Clear search
              </button>
            </div>
          )}
        </section>

        <section style={styles.bottomPanel}>
          <div style={styles.bottomText}>
            <span style={styles.kicker}>QUICK ACCESS</span>
            <h2 style={styles.sectionTitle}>
              Keep your printing organized.
            </h2>
            <p style={styles.bottomDescription}>
              Check your previous orders and follow their status.
            </p>
          </div>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => onNavigate?.('my-orders')}
          >
            View My Orders →
          </button>
        </section>
      </main>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} XeroxWala · Your documents,
        printed simply.
      </footer>

      <style>{`
        * {
          box-sizing: border-box;
        }

        button, input {
          font: inherit;
        }

        button {
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        button:focus-visible,
        input:focus-visible {
          outline: 3px solid #9c8bff;
          outline-offset: 3px;
        }

        button:hover {
          filter: brightness(0.98);
        }

        .unused {
          display: none;
        }

        @media (max-width: 900px) {
          .dashboard-services {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .dashboard-header {
            height: auto !important;
            min-height: 70px;
            padding: 14px 5% !important;
            flex-wrap: wrap;
          }

          .dashboard-hero {
            grid-template-columns: 1fr !important;
            padding: 32px 6% !important;
            margin-top: 22px !important;
          }

          .dashboard-hero-title {
            font-size: clamp(32px, 8vw, 44px) !important;
          }

          .dashboard-visual {
            min-height: 310px !important;
            margin-top: 10px;
          }

          .dashboard-section-heading {
            align-items: flex-start !important;
            flex-direction: column;
          }

          .dashboard-bottom {
            align-items: flex-start !important;
            flex-direction: column;
            padding: 24px !important;
          }

          .dashboard-bottom-button {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .dashboard-services {
            grid-template-columns: 1fr !important;
          }

          .dashboard-service-card {
            min-height: 150px !important;
          }

          .dashboard-nav {
            gap: 4px !important;
          }

          .dashboard-nav-button {
            padding: 9px 8px !important;
            font-size: 13px !important;
          }

          .dashboard-profile-button {
            padding: 9px 10px !important;
            font-size: 13px !important;
          }

          .dashboard-float-card {
            right: -4px !important;
          }

          .dashboard-ready-card {
            left: -4px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            scroll-behavior: auto !important;
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f7f8fc',
    color: '#18213b',
    fontFamily: 'Inter, system-ui, Arial, sans-serif',
    overflowX: 'hidden',
  },

  header: {
    height: 76,
    padding: '0 6%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fff',
    borderBottom: '1px solid #e9ebf4',
    gap: 16,
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    border: 0,
    background: 'transparent',
    fontWeight: 850,
    fontSize: 22,
    color: '#18213b',
    padding: 0,
  },

  logo: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: 12,
    background: 'linear-gradient(135deg,#6757f5,#9a65ff)',
    display: 'grid',
    placeItems: 'center',
    color: '#fff',
    boxShadow: '0 6px 15px #7865ed55',
  },

  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },

  navButton: {
    background: 'transparent',
    border: 0,
    color: '#59627a',
    padding: '10px 12px',
    fontWeight: 650,
    borderRadius: 10,
  },

  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: '1px solid #e5e7f1',
    borderRadius: 12,
    background: '#fff',
    padding: '10px 14px',
    color: '#303b56',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  main: {
    width: 'min(1120px, 90%)',
    margin: '0 auto',
  },

  hero: {
    marginTop: 36,
    minHeight: 390,
    borderRadius: 30,
    padding: '42px 5%',
    display: 'grid',
    gridTemplateColumns: '1.1fr .9fr',
    alignItems: 'center',
    gap: 20,
    overflow: 'hidden',
    background:
      'linear-gradient(120deg,#eef0ff 0%,#f7f0ff 55%,#e9f6ff 100%)',
    boxShadow: '0 20px 50px #3c4c8510',
  },

  heroText: {
    maxWidth: 520,
    minWidth: 0,
    position: 'relative',
    zIndex: 1,
  },

  eyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: 850,
    color: '#7461e9',
    marginBottom: 16,
  },

  heroTitle: {
    fontSize: 'clamp(34px, 4vw, 46px)',
    lineHeight: 1.13,
    letterSpacing: '-1.8px',
    margin: '0 0 18px',
    color: '#18213b',
  },

  gradientText: {
    background: 'linear-gradient(100deg,#6557ed,#9a5cf6)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },

  heroDescription: {
    maxWidth: 440,
    fontSize: 15,
    lineHeight: 1.8,
    color: '#68738d',
    margin: '0 0 20px',
  },

  trust: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    fontSize: 12,
    color: '#6b748d',
    marginTop: 20,
  },

  check: {
    color: '#16835e',
    fontWeight: 900,
  },

  primaryButton: {
    display: 'inline-flex',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
    border: 0,
    borderRadius: 13,
    background: 'linear-gradient(135deg,#6557ed,#8c5bf5)',
    color: '#fff',
    fontWeight: 750,
    padding: '15px 20px',
    boxShadow: '0 10px 20px #6c5aef44',
    marginTop: 10,
  },

  visualArea: {
    minHeight: 300,
    minWidth: 0,
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
  },

  orbit: {
    width: 'min(265px, 75vw)',
    height: 'min(265px, 75vw)',
    maxHeight: 265,
    maxWidth: 265,
    borderRadius: '50%',
    background: 'linear-gradient(145deg,#dcd9ff,#c6e8ff)',
    boxShadow:
      'inset -12px -15px 30px #8e8ce633, 0 25px 45px #6665b51c',
    position: 'absolute',
  },

  printer: {
    position: 'relative',
    width: 205,
    maxWidth: '80%',
    zIndex: 2,
    filter: 'drop-shadow(0 22px 12px #454b6a26)',
    transform: 'perspective(700px) rotateY(-8deg)',
  },

  printerTop: {
    height: 55,
    width: '81%',
    margin: '0 auto -3px',
    borderRadius: '12px 12px 3px 3px',
    background: 'linear-gradient(145deg,#fff,#dce1f1)',
    border: '1px solid #cbd2e5',
    display: 'grid',
    placeItems: 'center',
  },

  paper: {
    width: '58%',
    height: 52,
    background: '#fff',
    transform: 'translateY(-12px)',
    boxShadow: '0 3px 8px #5a658422',
    border: '1px solid #e4e6ef',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },

  paperLine: {
    height: 3,
    background: '#d6dbea',
    borderRadius: 2,
  },

  paperLineShort: {
    height: 3,
    width: '60%',
    background: '#c0c9e2',
    borderRadius: 2,
  },

  printerBody: {
    height: 120,
    borderRadius: 16,
    background: 'linear-gradient(145deg,#fdfdff,#cfd6e8)',
    border: '1px solid #c4ccdf',
    padding: 18,
    boxShadow: 'inset -7px -8px 14px #a6afc333',
  },

  printerScreen: {
    width: 27,
    height: 14,
    background: '#8272fa',
    borderRadius: 4,
    marginBottom: 13,
    boxShadow: '0 0 12px #8b7bff66',
    padding: 3,
  },

  printerSlot: {
    height: 7,
    borderRadius: 5,
    background: '#8f99b2',
    boxShadow: 'inset 0 2px 3px #414a6555',
  },

  printerTray: {
    width: '75%',
    height: 19,
    background: '#e8ebf5',
    border: '1px solid #b7c0d6',
    margin: '12px auto 0',
    borderRadius: '2px 2px 8px 8px',
    display: 'flex',
    justifyContent: 'center',
  },

  trayPaper: {
    width: '65%',
    height: 8,
    background: '#fff',
    borderRadius: '0 0 3px 3px',
    border: '1px solid #e2e6f1',
  },

  printerBase: {
    width: '73%',
    height: 12,
    margin: '0 auto',
    background: '#bac3d9',
    borderRadius: '0 0 8px 8px',
  },

  floatCard: {
    position: 'absolute',
    top: 8,
    right: 0,
    zIndex: 3,
    background: '#fff',
    borderRadius: 13,
    padding: '12px 14px',
    boxShadow: '0 12px 28px #434c761a',
    fontSize: 13,
    display: 'flex',
    gap: 9,
    alignItems: 'center',
    maxWidth: '95%',
  },

  floatIcon: {
    fontSize: 22,
  },

  floatTitle: {
    display: 'block',
    fontSize: 12,
    color: '#303b56',
  },

  floatSubtitle: {
    display: 'block',
    fontSize: 10,
    color: '#7c8499',
    marginTop: 4,
  },

  readyCard: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    zIndex: 3,
    background: '#fff',
    borderRadius: 13,
    padding: 12,
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    boxShadow: '0 12px 28px #434c761a',
    fontSize: 12,
    maxWidth: '95%',
  },

  readyIcon: {
    width: 30,
    height: 30,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 10,
    background: '#e1f8ef',
    color: '#16835e',
    fontWeight: 900,
  },

  readyTitle: {
    display: 'block',
    color: '#303b56',
  },

  readySubtitle: {
    display: 'block',
    fontSize: 10,
    color: '#7c8499',
    marginTop: 4,
  },

  section: {
    padding: '42px 0 30px',
  },

  sectionHeading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end',
    gap: 16,
    marginBottom: 20,
  },

  kicker: {
    fontSize: 11,
    letterSpacing: 1.8,
    color: '#7c68eb',
    fontWeight: 850,
  },

  sectionTitle: {
    fontSize: 'clamp(22px, 3vw, 27px)',
    letterSpacing: '-.6px',
    margin: '8px 0 0',
    color: '#202a45',
  },

  sectionNote: {
    fontSize: 12,
    color: '#7b8499',
  },

  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 480,
    padding: '0 14px',
    minHeight: 48,
    marginBottom: 20,
    border: '1px solid #e1e5f0',
    borderRadius: 13,
    background: '#fff',
    color: '#7b8499',
  },

  searchInput: {
    flex: 1,
    width: '100%',
    minWidth: 0,
    border: 0,
    outline: 'none',
    background: 'transparent',
    color: '#202a45',
    fontSize: 14,
    padding: '12px 0',
  },

  clearSearch: {
    border: 0,
    background: '#f0efff',
    color: '#6653d9',
    borderRadius: 7,
    width: 26,
    height: 26,
    fontSize: 19,
    lineHeight: 1,
  },

  services: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
  },

  serviceCard: {
    position: 'relative',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    padding: 20,
    minHeight: 190,
    borderRadius: 19,
    border: '1px solid #e9ebf4',
    background: '#fff',
    color: '#202a45',
    boxShadow: '0 8px 20px #343f6b08',
    transition: 'transform .2s, box-shadow .2s',
  },

  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    display: 'grid',
    placeItems: 'center',
    fontSize: 24,
    boxShadow: 'inset 0 -4px 8px #00000008',
  },

  serviceTitle: {
    fontSize: 14,
    lineHeight: 1.45,
    paddingRight: 10,
  },

  serviceDesc: {
    fontSize: 12,
    lineHeight: 1.6,
    color: '#7c8499',
  },

  cardArrow: {
    position: 'absolute',
    top: 18,
    right: 18,
    color: '#9b91d9',
  },

  noResults: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: '32px 16px',
    textAlign: 'center',
    borderRadius: 18,
    background: '#fff',
    border: '1px solid #e9ebf4',
  },

  resetButton: {
    background: '#f4f2ff',
    color: '#6653d9',
    border: '1px solid #dcd8ff',
    borderRadius: 10,
    padding: '10px 14px',
    fontWeight: 700,
  },

  bottomPanel: {
    margin: '10px 0 36px',
    borderRadius: 22,
    padding: '26px 30px',
    background: '#fff',
    border: '1px solid #e9ebf4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    boxShadow: '0 8px 24px #343f6b08',
  },

  bottomText: {
    minWidth: 0,
  },

  bottomDescription: {
    fontSize: 14,
    lineHeight: 1.6,
    color: '#7c8499',
    margin: '10px 0 0',
  },

  secondaryButton: {
    whiteSpace: 'nowrap',
    border: '1px solid #dcd8ff',
    background: '#f4f2ff',
    color: '#6653d9',
    borderRadius: 12,
    padding: '13px 17px',
    fontWeight: 750,
  },

  footer: {
    textAlign: 'center',
    color: '#939aae',
    fontSize: 12,
    lineHeight: 1.7,
    padding: '22px 12px',
    borderTop: '1px solid #e9ebf4',
    background: '#fff',
  },
}
