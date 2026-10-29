
const API_BASE_URL = 'http://localhost:8080/api/payments'

// Handle responses from the backend
async function readResponse(response) {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data.message || 'Payment request failed.'
    )
  }

  return data
}

// Create a Razorpay payment order through our backend
export async function createRazorpayOrder(orderId) {
  const response = await fetch(
    `${API_BASE_URL}/order/${orderId}/razorpay-order`,
    {
      method: 'POST',
    }
  )

  return readResponse(response)
}

// Verify the payment with our backend
export async function verifyRazorpayPayment(paymentDetails) {
  const response = await fetch(
    `${API_BASE_URL}/verify-razorpay`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpayOrderId:
          paymentDetails.razorpay_order_id,

        razorpayPaymentId:
          paymentDetails.razorpay_payment_id,

        razorpaySignature:
          paymentDetails.razorpay_signature,
      }),
    }
  )

  return readResponse(response)
}

// Get payment details for a print order
export async function getOrderPayment(orderId) {
  const response = await fetch(
    `${API_BASE_URL}/order/${orderId}`
  )

  return readResponse(response)
}
