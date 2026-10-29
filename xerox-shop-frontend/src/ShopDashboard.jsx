/* eslint-disable react-hooks/rules-of-hooks */

import { useEffect, useState, useCallback } from 'react'
import './ShopDashboard.css'

const API_URL = 'http://localhost:8080/api/orders/dashboard'
const STATUS_API_URL = 'http://localhost:8080/api/orders'

const WORKFLOW_STATUSES = ['PENDING', 'PRINTING', 'READY', 'COMPLETED']

function getNextStatus(status) {
  const index = WORKFLOW_STATUSES.indexOf(
    String(status || 'PENDING').toUpperCase()
  )

  return index < 0 || index >= WORKFLOW_STATUSES.length - 1
    ? null
    : WORKFLOW_STATUSES[index + 1]
}

function getAllowedStatuses(status) {
  const current = String(status || 'PENDING').toUpperCase()

  if (['COMPLETED', 'CANCELLED'].includes(current)) {
    return [current]
  }

  const next = getNextStatus(current)
  return [current, ...(next ? [next] : []), 'CANCELLED']
}

function getOwnerHeaders(extraHeaders = {}) {
  const auth = sessionStorage.getItem('xeroxwalaOwnerAuth')

  return {
    ...extraHeaders,
    ...(auth ? { Authorization: `Basic ${auth}` } : {}),
  }
}

const money = value =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const pretty = value =>
  String(value || 'Unknown')
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase())

function StatusBadge({ value }) {
  const status = String(value || 'UNKNOWN').toUpperCase()

  return (
    <span className={`xo-badge xo-${status.toLowerCase()}`}>
      {pretty(status)}
    </span>
  )
}

function MetricCard({ icon, label, value, note, tone }) {
  return (
    <article className={`xo-metric xo-${tone}`}>
      <div className="xo-metric-top">
        <span className="xo-metric-icon">{icon}</span>
        <span className="xo-metric-dot" />
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
      <span className="xo-metric-note">{note}</span>
    </article>
  )
}

export default function ShopDashboard() {


const shopName =
  sessionStorage.getItem('xeroxwalaShopName') ||
  'My Shop'
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [refreshing, setRefreshing] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  const [selectedOrderFiles, setSelectedOrderFiles] = useState(null)
  const [loadingFilesOrderId, setLoadingFilesOrderId] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewFilename, setPreviewFilename] = useState('')
  const [previewFile, setPreviewFile] = useState(null)
  const [printingFileId, setPrintingFileId] = useState(null)
  const [previewError, setPreviewError] = useState('')
  const [loadingPreviewFileId, setLoadingPreviewFileId] = useState(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const loadOrders = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true)
      else setLoading(true)

      setError('')

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: getOwnerHeaders({ Accept: 'application/json' }),
      })

      if (!response.ok) {
        throw new Error(`Could not load orders (${response.status})`)
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('Unexpected response from server')
      }

      setOrders(data)
    } catch (err) {
      console.error('Dashboard loading error:', err)
      setError(err.message || 'Unable to load orders. Check the backend.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => loadOrders(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadOrders])

  async function handleStatusChange(order, newStatus) {
    const currentStatus = String(
      order.orderStatus || 'PENDING'
    ).toUpperCase()

    if (newStatus === currentStatus) return

    if (!getAllowedStatuses(currentStatus).includes(newStatus)) {
      window.alert('This status change is not allowed.')
      return
    }

    if (
      newStatus === 'CANCELLED' &&
      !window.confirm(
        `Are you sure you want to cancel order #${order.orderNumber || order.orderId}? This action cannot be undone.`
      )
    ) {
      return
    }

    setUpdatingOrderId(order.orderId)

    try {
      const response = await fetch(
        `${STATUS_API_URL}/${order.orderId}/status`,
        {
          method: 'PUT',
          headers: getOwnerHeaders({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (!response.ok) {
        const message = await response.text()
        throw new Error(
          message || `Failed to update order status (${response.status})`
        )
      }

      const updatedOrder = await response.json()

      setOrders(previous =>
        previous.map(item =>
          item.orderId === updatedOrder.orderId ? updatedOrder : item
        )
      )
    } catch (err) {
      console.error('Order status update error:', err)
      window.alert(err.message || 'Could not update order status.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  async function handleViewDocuments(order) {
    setLoadingFilesOrderId(order.orderId)
    setPreviewError('')
    setPreviewFilename('')
    setPreviewFile(null)
    setPreviewUrl('')

    try {
      const response = await fetch(
        `${STATUS_API_URL}/${order.orderId}/files`,
        { headers: getOwnerHeaders() }
      )

      if (!response.ok) {
        throw new Error(`Could not load documents (${response.status})`)
      }

      const files = await response.json()

      if (!Array.isArray(files)) {
        throw new Error('Unexpected response when loading documents')
      }

      setSelectedOrderFiles({ order, files })
    } catch (err) {
      console.error('Document list error:', err)
      window.alert(err.message || 'Could not load documents.')
    } finally {
      setLoadingFilesOrderId(null)
    }
  }

  async function handlePreviewFile(file) {
    if (!selectedOrderFiles) return

    const orderId = selectedOrderFiles.order.orderId

    setLoadingPreviewFileId(file.fileId)
    setPreviewError('')
    setPreviewFilename(file.filename || file.originalFilename || 'document')
    setPreviewFile(file)
    setPreviewUrl('')

    try {
      const response = await fetch(
        `${STATUS_API_URL}/${orderId}/files/${file.fileId}/download`,
        { headers: getOwnerHeaders() }
      )

      if (!response.ok) {
        throw new Error(`Could not open document (${response.status})`)
      }

      const blob = await response.blob()
      setPreviewUrl(URL.createObjectURL(blob))
    } catch (err) {
      console.error('Document preview error:', err)
      setPreviewError(err.message || 'Unable to preview this document.')
    } finally {
      setLoadingPreviewFileId(null)
    }
  }

  async function handleEnhanceDocument(file) {
    if (!selectedOrderFiles) return

    const order = selectedOrderFiles.order
    const orderId = order.orderId
    const filename = file.filename || file.originalFilename || ''

    if (!/\.(png|jpe?g)$/i.test(filename)) {
      window.alert(
        'Enhancement currently supports PNG, JPG and JPEG images only.'
      )
      return
    }

    if (
      !window.confirm(
        `Enhance "${filename}"?\n\nThe original file will be kept, and a separate enhanced copy will be created.`
      )
    ) {
      return
    }

    setLoadingPreviewFileId(file.fileId)
    setPreviewError('')

    try {
      const response = await fetch(
        `${STATUS_API_URL}/${orderId}/files/${file.fileId}/enhance`,
        { method: 'POST', headers: getOwnerHeaders() }
      )

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Enhancement failed (${response.status})`)
      }

      const result = await response.json()

      const filesResponse = await fetch(
        `${STATUS_API_URL}/${orderId}/files`,
        { headers: getOwnerHeaders() }
      )

      if (!filesResponse.ok) {
        throw new Error(
          'Enhancement may have succeeded, but the file list could not be refreshed. Close and reopen the document list.'
        )
      }

      const files = await filesResponse.json()
      setSelectedOrderFiles({ order, files })

      const enhancedFile = files.find(
        item => String(item.fileId) === String(result.enhancedFileId)
      )

      if (enhancedFile) {
        const enhancedName =
          enhancedFile.filename ||
          enhancedFile.originalFilename ||
          'Enhanced document'

        setPreviewFilename(enhancedName)
        setPreviewFile(enhancedFile)

        const enhancedResponse = await fetch(
          `${STATUS_API_URL}/${orderId}/files/${enhancedFile.fileId}/download`,
          { headers: getOwnerHeaders() }
        )

        if (!enhancedResponse.ok) {
          throw new Error(
            `Enhanced file created, but preview failed (${enhancedResponse.status})`
          )
        }

        const blob = await enhancedResponse.blob()
        setPreviewUrl(URL.createObjectURL(blob))
      }

      window.alert(
        `Enhancement complete!\n${result.filename || 'Enhanced document'}\n\nThe enhanced copy is selected for preview.`
      )
    } catch (err) {
      console.error('Document enhancement error:', err)
      setPreviewError(err.message || 'Could not enhance this document.')
      window.alert(err.message || 'Could not enhance this document.')
    } finally {
      setLoadingPreviewFileId(null)
    }
  }

  function handlePrintSelectedImage() {
    if (!previewUrl || !previewFile) return

    const filename =
      previewFile.filename ||
      previewFile.originalFilename ||
      'enhanced-image'

    if (!/\.(png|jpe?g)$/i.test(filename)) {
      window.alert('This print option is for PNG, JPG, and JPEG images only.')
      return
    }

    if (
      !window.confirm(
        `Open "${filename}" in the print dialog? Make sure the shop printer is connected and ready.`
      )
    ) {
      return
    }

    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      window.alert(
        'The print window was blocked. Allow pop-ups for localhost and try again.'
      )
      return
    }

    const safeTitle = filename.replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character])

    printWindow.document.open()
    printWindow.document.write(`<!doctype html>
      <html><head><meta charset="utf-8"><title>${safeTitle}</title>
      <style>@page{margin:8mm}html,body{margin:0;padding:0;width:100%;height:100%}
      body{display:flex;align-items:center;justify-content:center}
      img{display:block;max-width:100%;max-height:98vh;object-fit:contain}</style>
      </head><body><img id="print-image" src="${previewUrl}" alt="${safeTitle}">
      <script>
        const image = document.getElementById('print-image');
        image.onload = () => { window.focus(); window.print(); };
        image.onerror = () => { alert('Could not load the image for printing.'); window.close(); };
        if (image.complete && image.naturalWidth > 0) { window.focus(); window.print(); }
      </script></body></html>`)
    printWindow.document.close()
  }

  async function handlePrintSelectedFile() {
    if (!selectedOrderFiles || !previewFile) return

    const order = selectedOrderFiles.order
    const filename = previewFile.filename || previewFile.originalFilename || ''

    if (!/\.pdf$/i.test(filename)) {
      window.alert(
        'Only PDF files can be printed using the current backend print endpoint.'
      )
      return
    }

    if (String(order.paymentStatus || '').toUpperCase() !== 'PAID') {
      window.alert('This order must be paid before printing.')
      return
    }

    if (
      !window.confirm(
        `Send "${filename}" for printing? Make sure the shop printer is connected and ready.`
      )
    ) {
      return
    }

    setPrintingFileId(previewFile.fileId)

    try {
      const response = await fetch(
        `${STATUS_API_URL}/${order.orderId}/files/${previewFile.fileId}/print`,
        { method: 'POST', headers: getOwnerHeaders() }
      )

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Print request failed (${response.status})`)
      }

      window.alert(
        'The print request was sent to the backend. Check the shop computer/printer.'
      )
    } catch (err) {
      console.error('Print request error:', err)
      window.alert(err.message || 'Could not send the print request.')
    } finally {
      setPrintingFileId(null)
    }
  }

  function closeDocumentViewer() {
    setSelectedOrderFiles(null)
    setPreviewUrl('')
    setPreviewFilename('')
    setPreviewFile(null)
    setPreviewError('')
  }

  // Search and status filtering
  const filteredOrders = orders.filter(order => {
    const term = search.trim().toLowerCase()
    const status = String(order.orderStatus || 'PENDING').toUpperCase()

    const matchesStatus =
      statusFilter === 'ALL' || status === statusFilter

    const searchableValues = [
      order.orderNumber,
      order.orderId,
      order.customerName,
      order.customerPhone,
      order.orderStatus,
      order.paymentStatus,
    ]

    const matchesSearch =
      !term ||
      searchableValues.some(value =>
        String(value ?? '').toLowerCase().includes(term)
      )

    return matchesStatus && matchesSearch
  })

  const countStatus = status =>
    orders.filter(
      order => String(order.orderStatus || 'PENDING').toUpperCase() === status
    ).length

  const paidOrders = orders.filter(
    order => String(order.paymentStatus || '').toUpperCase() === 'PAID'
  ).length

  const pendingOrders = orders.filter(order =>
    ['PENDING', 'PROCESSING'].includes(
      String(order.orderStatus || '').toUpperCase()
    )
  ).length

  const printingOrders = countStatus('PRINTING')
  const readyOrders = countStatus('READY')

  const totalRevenue = orders.reduce((sum, order) => {
    if (String(order.paymentStatus || '').toUpperCase() !== 'PAID') {
      return sum
    }

    return sum + Number(order.totalAmount || 0)
  }, 0)

  return (
    <main className="xo-page">
      <div className="xo-shell">
        <header className="xo-topbar">
          <div className="xo-brand">
            <div className="xo-logo">X</div>
            <div>
              <h1>XeroxWala</h1>
              <p>PRINT SHOP MANAGEMENT</p>
              <span className="xo-live">Owner workspace</span>
            </div>
          </div>

         
          <div className="xo-topbar-actions">
  <span className="xo-shop-name">
    🏪 {shopName}
  </span>

  <button
    className="xo-btn"
    type="button"
    onClick={() => loadOrders(true)}
    disabled={refreshing || loading}
  >
    {refreshing ? 'Refreshing…' : '↻ Refresh orders'}
  </button>

  <button
    className="xo-btn xo-signout-btn"
    type="button"
    onClick={() => {
      sessionStorage.removeItem('xeroxwalaOwnerAuth')
      sessionStorage.removeItem('xeroxwalaOwner')
      window.location.reload()
    }}
  >
    Sign Out
  </button>
</div>
        </header>

        <section className="xo-hero">
          <div>
            <p className="xo-eyebrow">SHOP OVERVIEW</p>
            <h2>Your print shop, at a glance.</h2>
            <p>
              Keep orders moving, track payments, and get every print ready for pickup.
            </p>
          </div>

          <div className="xo-date">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </section>

        <section className="xo-metrics" aria-label="Order summary">
          <MetricCard
            icon="▤"
            label="Total orders"
            value={orders.length}
            note="All orders received"
            tone="blue"
          />
          <MetricCard
            icon="✓"
            label="Paid orders"
            value={paidOrders}
            note="Payment confirmed"
            tone="green"
          />
          <MetricCard
            icon="◷"
            label="Awaiting action"
            value={pendingOrders}
            note="Pending or processing"
            tone="amber"
          />
          <MetricCard
            icon="₹"
            label="Paid revenue"
            value={money(totalRevenue)}
            note="Paid orders only"
            tone="violet"
          />
        </section>

        <section className="xo-workflow" aria-label="Production status summary">
          <div className="xo-flow">
            <div className="xo-flow-icon">◷</div>
            <div>
              <strong>{pendingOrders}</strong>
              <span>Waiting to be processed</span>
            </div>
          </div>

          <div className="xo-flow">
            <div className="xo-flow-icon xo-flow-amber">▧</div>
            <div>
              <strong>{printingOrders}</strong>
              <span>Currently printing</span>
            </div>
          </div>

          <div className="xo-flow">
            <div className="xo-flow-icon xo-flow-green">✓</div>
            <div>
              <strong>{readyOrders}</strong>
              <span>Ready for customer pickup</span>
            </div>
          </div>
        </section>

        <section className="xo-panel">
          <div className="xo-panel-head">
            <div>
              <h3>Print orders</h3>
              <p>
                {filteredOrders.length} of {orders.length} orders · Manage documents and order status
              </p>
            </div>

            <div className="xo-search-wrap">
              <span aria-hidden="true">⌕</span>

              <input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search orders, customers, phone..."
                aria-label="Search print orders"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="xo-filterbar" aria-label="Filter orders by status">
            {[
              ['ALL', 'All orders', orders.length],
              ['PENDING', 'Pending', countStatus('PENDING')],
              ['PRINTING', 'Printing', printingOrders],
              ['READY', 'Ready', readyOrders],
              ['COMPLETED', 'Completed', countStatus('COMPLETED')],
              ['CANCELLED', 'Cancelled', countStatus('CANCELLED')],
            ].map(([value, label, count]) => (
              <button
                key={value}
                type="button"
                className={`xo-filter${statusFilter === value ? ' active' : ''}`}
                onClick={() => setStatusFilter(value)}
                aria-pressed={statusFilter === value}
              >
                {label} <span>{count}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="xo-empty">
              <div className="xo-empty-icon">◌</div>
              <strong>Loading your orders…</strong>
              <p>Getting the latest shop activity.</p>
            </div>
          ) : error ? (
            <div className="xo-error">
              <strong>We couldn't load your orders.</strong>
              <p>{error}</p>
              <button
                className="xo-btn xo-btn-secondary"
                type="button"
                onClick={() => loadOrders()}
              >
                Try again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="xo-empty">
              <div className="xo-empty-icon">{orders.length ? '⌕' : '▤'}</div>
              <strong>
                {orders.length
                  ? 'No matching orders'
                  : 'Your orders will appear here'}
              </strong>
              <p>
                {orders.length
                  ? 'Try another search or status filter.'
                  : 'New customer print orders will show up here after you refresh.'}
              </p>

              {(search || statusFilter !== 'ALL') && (
                <button
                  className="xo-btn xo-btn-secondary"
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('ALL')
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="xo-table-wrap">
              <table className="xo-table">
                <thead>
                  <tr>
                    {[
                      'Order / Customer',
                      'Type',
                      'Print details',
                      'Pickup',
                      'Amount',
                      'Documents',
                      'Order status',
                      'Payment',
                    ].map(label => (
                      <th key={label}>{label}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map(order => {
                    const isGuest = order.guestCustomerId != null
                    const currentStatus = String(
                      order.orderStatus || 'PENDING'
                    ).toUpperCase()
                    const allowedStatuses = getAllowedStatuses(currentStatus)
                    const isUpdating = updatingOrderId === order.orderId
                    const isFinalStatus = [
                      'COMPLETED',
                      'CANCELLED',
                    ].includes(currentStatus)
                    const isLoadingFiles =
                      loadingFilesOrderId === order.orderId

                    return (
                      <tr key={order.orderId}>
                        <td>
                          <div className="xo-order-number">
                            #{order.orderNumber || order.orderId}
                          </div>
                          <div className="xo-muted">ID: {order.orderId}</div>
                          <div className="xo-customer">
                            {order.customerName || 'Customer'}
                          </div>
                          <div className="xo-phone">
                            {order.customerPhone || 'No mobile number registered'}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`xo-type ${isGuest ? 'guest' : 'registered'}`}
                          >
                            {isGuest ? 'GUEST' : 'REGISTERED'}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {order.pageCount ?? '—'} pages × {order.copies ?? '—'}
                          </strong>
                          <div className="xo-muted">
                            {pretty(order.colorMode)} · {pretty(order.printSides)}
                          </div>
                        </td>

                        <td>
                          {order.pickupAt ? (
                            <>
                              <div className="xo-pickup-date">
                                {new Date(order.pickupAt).toLocaleDateString(
                                  'en-IN',
                                  { day: '2-digit', month: 'short' }
                                )}
                              </div>
                              <div className="xo-muted">
                                {new Date(order.pickupAt).toLocaleTimeString(
                                  'en-IN',
                                  { hour: '2-digit', minute: '2-digit' }
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="xo-muted">Not scheduled</span>
                          )}
                        </td>

                        <td>
                          <strong className="xo-amount">
                            {money(order.totalAmount)}
                          </strong>
                        </td>

                        <td>
                          <button
                            className="xo-btn xo-small-btn"
                            type="button"
                            onClick={() => handleViewDocuments(order)}
                            disabled={isLoadingFiles}
                          >
                            {isLoadingFiles ? 'Loading…' : '▤ View files'}
                          </button>
                        </td>

                        <td>
                          <select
                            className="xo-select"
                            value={currentStatus}
                            disabled={isUpdating || isFinalStatus}
                            onChange={event =>
                              handleStatusChange(order, event.target.value)
                            }
                            aria-label={`Update status for order ${order.orderNumber || order.orderId}`}
                          >
                            {allowedStatuses.map(status => (
                              <option key={status} value={status}>
                                {status === 'CANCELLED'
                                  ? 'Cancel order'
                                  : pretty(status)}
                              </option>
                            ))}
                          </select>

                          {isUpdating && (
                            <div className="xo-muted">Updating status…</div>
                          )}

                          {isFinalStatus && (
                            <div className="xo-muted">
                              {currentStatus === 'CANCELLED'
                                ? 'Cancelled'
                                : 'Completed'}
                            </div>
                          )}
                        </td>

                        <td>
                          <StatusBadge value={order.paymentStatus} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="xo-footer">
          <span>
            © {new Date().getFullYear()} XeroxWala · Shop Management
          </span>
          <span>Orders and payments are synced with your backend.</span>
        </footer>
      </div>

      {selectedOrderFiles && (
        <div
          className="xo-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Order documents"
        >
          <section className="xo-modal">
            <header className="xo-modal-head">
              <div>
                <h3>Order documents</h3>
                <p>
                  Order #
                  {selectedOrderFiles.order.orderNumber ||
                    selectedOrderFiles.order.orderId}
                  {' · '}
                  {selectedOrderFiles.files.length} file(s)
                </p>
              </div>

              <button
                type="button"
                className="xo-btn xo-btn-secondary"
                onClick={closeDocumentViewer}
              >
                ✕ Close
              </button>
            </header>

            <div className="xo-modal-content">
              <aside className="xo-files">
                <h4>Uploaded files</h4>

                {selectedOrderFiles.files.length === 0 ? (
                  <p className="xo-no-files">
                    No files uploaded for this order.
                  </p>
                ) : (
                  selectedOrderFiles.files.map(file => {
                    const filename =
                      file.filename ||
                      file.originalFilename ||
                      `File ${file.fileId}`

                    const isProcessing =
                      loadingPreviewFileId === file.fileId

                    return (
                      <article className="xo-file" key={file.fileId}>
                        <div className="xo-file-name">{filename}</div>

                        <div className="xo-file-meta">
                          {file.fileSizeBytes
                            ? `${(
                                file.fileSizeBytes /
                                (1024 * 1024)
                              ).toFixed(2)} MB`
                            : file.mimeType || 'Uploaded document'}
                        </div>

                        <button
                          className="xo-btn xo-file-btn"
                          type="button"
                          onClick={() => handlePreviewFile(file)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Loading…' : 'View file'}
                        </button>

                        <button
                          className="xo-btn xo-btn-green xo-file-btn"
                          type="button"
                          onClick={() => handleEnhanceDocument(file)}
                          disabled={isProcessing}
                        >
                          {isProcessing
                            ? 'Processing…'
                            : '✦ Enhance image'}
                        </button>
                      </article>
                    )
                  })
                )}
              </aside>

              <div className="xo-preview">
                {previewError ? (
                  <div className="xo-preview-error">{previewError}</div>
                ) : previewUrl ? (
                  <>
                    <div className="xo-preview-toolbar">
                      <strong className="xo-preview-name">
                        {previewFilename}
                      </strong>

                      {/\.(png|jpe?g)$/i.test(previewFilename) && (
                        <button
                          type="button"
                          className="xo-btn xo-btn-green"
                          onClick={handlePrintSelectedImage}
                        >
                          Print image
                        </button>
                      )}

                      {/\.pdf$/i.test(previewFilename) && (
                        <button
                          type="button"
                          className="xo-btn xo-btn-green"
                          disabled={printingFileId === previewFile?.fileId}
                          onClick={handlePrintSelectedFile}
                        >
                          {printingFileId === previewFile?.fileId
                            ? 'Sending…'
                            : 'Print PDF'}
                        </button>
                      )}

                      <a
                        className="xo-download"
                        href={previewUrl}
                        download={previewFilename}
                      >
                        Download ↓
                      </a>
                    </div>

                    {/\.(png|jpe?g)$/i.test(previewFilename) ? (
                      <div className="xo-preview-stage">
                        <img src={previewUrl} alt={previewFilename} />
                      </div>
                    ) : /\.pdf$/i.test(previewFilename) ? (
                      <iframe
                        title={`Preview of ${previewFilename}`}
                        src={previewUrl}
                        className="xo-pdf-frame"
                      />
                    ) : (
                      <div className="xo-preview-unsupported">
                        Preview isn't supported for this file type. Use
                        Download to open it.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="xo-preview-empty">
                    <div className="xo-empty-icon">▤</div>
                    <strong>Select a document to preview</strong>
                    <p>Choose a file from the uploaded files panel.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
