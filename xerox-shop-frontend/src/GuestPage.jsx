import PageShell, { buttonStyle, linkStyle } from './PageShell'
export default function GuestPage({ onNavigate, onContinue }) {
 return <PageShell title="Continue as Guest" subtitle="No account needed. Enter the order page and provide your name and phone number." onHome={() => onNavigate('customer-login')}>
   <p style={{ color: '#475569', lineHeight: 1.6 }}>You can place an order as a guest and pay through the existing checkout.</p>
   <button style={buttonStyle} type="button" onClick={onContinue}>Continue to Guest Ordering</button>
   <p style={{ textAlign: 'center' }}><button style={linkStyle} onClick={() => onNavigate('customer-login')}>Back to Customer Login</button></p>
 </PageShell>
}
