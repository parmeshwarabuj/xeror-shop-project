
/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from 'react'
import './MainAdminDashboard.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Normalize values so searches and status filters ignore case and extra spaces.
const normalize = (value) =>
    String(value ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '')

export default function MainAdminDashboard({ onBack }) {
    const [data, setData] = useState(null)
    const [error, setError] = useState('')
    const [actionError, setActionError] = useState('')
    const [actionMessage, setActionMessage] = useState('')
    const [activatingOwnerId, setActivatingOwnerId] = useState(null)
    const [loading, setLoading] = useState(true)

    const [ownerSearch, setOwnerSearch] = useState('')
    const [ownerFilter, setOwnerFilter] = useState('all')
    const [customerSearch, setCustomerSearch] = useState('')
    const [orderSearch, setOrderSearch] = useState('')
    const [orderFilter, setOrderFilter] = useState('all')

    // Order date filters and sorting
    const [orderStartDate, setOrderStartDate] = useState('')
    const [orderEndDate, setOrderEndDate] = useState('')
    const [orderSort, setOrderSort] = useState('newest')

    const loadDashboard = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true)
        setError('')

        try {
            const auth = sessionStorage.getItem('xeroxwalaAdminAuth')

            if (!auth) {
                throw new Error('Admin session not found. Please sign in again.')
            }

            const response = await fetch(`${API_URL}/api/admin/dashboard`, {
                headers: {
                    Authorization: `Basic ${auth}`,
                    Accept: 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(
                    response.status === 401 || response.status === 403
                        ? 'Admin authentication failed. Please sign in again.'
                        : `Could not load dashboard (HTTP ${response.status}).`
                )
            }

            const result = await response.json()
            setData(result)
        } catch (err) {
            setError(err.message || 'Unable to load dashboard.')
        } finally {
            if (showLoading) setLoading(false)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDashboard()
    }, [loadDashboard])

    async function toggleShopStatus(owner) {
        const shopIsActive = owner.shopActive === true
        const action = shopIsActive ? 'deactivate' : 'activate'
        const actionLabel = shopIsActive ? 'Disable' : 'Activate'

        const confirmed = window.confirm(
            `${actionLabel} the shop "${owner.shopName}"?`
        )

        if (!confirmed) return

        setActivatingOwnerId(owner.ownerId)
        setActionError('')
        setActionMessage('')

        try {
            const auth = sessionStorage.getItem('xeroxwalaAdminAuth')

            if (!auth) {
                throw new Error('Admin session not found. Please sign in again.')
            }

            const response = await fetch(
                `${API_URL}/api/admin/shop-owners/${owner.ownerId}/${action}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Basic ${auth}`,
                        Accept: 'application/json',
                    },
                }
            )

            if (!response.ok) {
                throw new Error(
                    response.status === 401 || response.status === 403
                        ? 'Admin authentication failed. Please sign in again.'
                        : `Could not ${action} shop (HTTP ${response.status}).`
                )
            }

            const result = await response.json()

            setActionMessage(
                result.message ||
                `Shop ${shopIsActive ? 'deactivated' : 'activated'} successfully.`
            )

            await loadDashboard(false)
        } catch (err) {
            setActionError(err.message || 'Unable to update shop status.')
        } finally {
            setActivatingOwnerId(null)
        }
    }

    if (loading) {
        return (
            <main className="admin-page">
                <p>Loading admin dashboard...</p>
            </main>
        )
    }

    if (error) {
        return (
            <main className="admin-page">
                <h1>Main Admin Dashboard</h1>
                <p role="alert">{error}</p>

                <button type="button" onClick={() => loadDashboard()}>
                    Try again
                </button>

                <button type="button" onClick={onBack}>
                    Back to website
                </button>
            </main>
        )
    }

    const customers = data?.customers || []
    const owners = data?.shopOwners || []
    const orders = data?.orders || []

    // Customer search
    const customerQuery = normalize(customerSearch)

    const filteredCustomers = customers.filter((customer) =>
        [
            customer.customerId,
            customer.fullName,
            customer.email,
            customer.phone,
        ].some((value) => normalize(value).includes(customerQuery))
    )

    // Shop owner search and status filter
    const ownerQuery = normalize(ownerSearch)

    const filteredOwners = owners.filter((owner) => {
        const matchesSearch = [
            owner.ownerId,
            owner.ownerName,
            owner.username,
            owner.phone,
            owner.email,
            owner.shopId,
            owner.shopName,
        ].some((value) => normalize(value).includes(ownerQuery))

        const isEnabled = owner.enabled === true
        const isShopActive = owner.shopActive === true

        let matchesFilter = true

        if (ownerFilter === 'enabled') {
            matchesFilter = isEnabled && isShopActive
        } else if (ownerFilter === 'pending') {
            matchesFilter = !isEnabled
        } else if (ownerFilter === 'disabled') {
            matchesFilter = isEnabled && !isShopActive
        }

        return matchesSearch && matchesFilter
    })

    // Get the actual order statuses returned by the backend
    const orderStatuses = [
        ...new Set(
            orders
                .map((order) => String(order.orderStatus ?? '').trim())
                .filter(Boolean)
        ),
    ].sort((a, b) => a.localeCompare(b))

    const orderQuery = normalize(orderSearch)

    // Parse a date-only value as a local calendar date.
    function parseLocalDate(dateString) {
        if (!dateString) return null

        const [year, month, day] = dateString.split('-').map(Number)

        if (!year || !month || !day) return null

        return new Date(year, month - 1, day)
    }

    const startDate = parseLocalDate(orderStartDate)
    const endDate = parseLocalDate(orderEndDate)

    // Filter and sort orders by search, status and creation date
    const filteredOrders = orders
        .filter((order) => {
            const matchesSearch = [
                order.orderId,
                order.orderNumber,
                order.customerName,
                order.customerPhone,
                order.shopId,
                order.shopName,
                order.orderStatus,
                order.paymentStatus,
            ].some((value) => normalize(value).includes(orderQuery))

            const matchesStatus =
                orderFilter === 'all' ||
                normalize(order.orderStatus) === normalize(orderFilter)

            const orderDate = order.createdAt
                ? new Date(order.createdAt)
                : null

            const hasValidDate =
                orderDate && !Number.isNaN(orderDate.getTime())

            const matchesStartDate =
                !startDate ||
                (
                    hasValidDate &&
                    orderDate >= startDate
                )

            // Include the entire end date, through 11:59:59 PM.
            const endDateExclusive = endDate
                ? new Date(
                    endDate.getFullYear(),
                    endDate.getMonth(),
                    endDate.getDate() + 1
                )
                : null

            const matchesEndDate =
                !endDateExclusive ||
                (
                    hasValidDate &&
                    orderDate < endDateExclusive
                )

            return (
                matchesSearch &&
                matchesStatus &&
                matchesStartDate &&
                matchesEndDate
            )
        })
        .sort((a, b) => {
            const timeA = a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0

            const timeB = b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0

            const safeTimeA = Number.isNaN(timeA) ? 0 : timeA
            const safeTimeB = Number.isNaN(timeB) ? 0 : timeB

            return orderSort === 'oldest'
                ? safeTimeA - safeTimeB
                : safeTimeB - safeTimeA
        })

    return (
        <main className="admin-page">
            <header className="admin-header">
                <div>
                    <p className="admin-eyebrow">XEROXWALA MANAGEMENT</p>
                    <h1>Main Admin Dashboard</h1>
                    <p>Manage customers, shop owners and print orders.</p>
                </div>

                <div>
                    <button
                        type="button"
                        onClick={() => loadDashboard()}
                    >
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            sessionStorage.removeItem('xeroxwalaAdminAuth')
                            sessionStorage.removeItem('xeroxwalaAdminDashboard')
                            onBack()
                        }}
                    >
                        Sign out
                    </button>
                </div>
            </header>

            {actionMessage && (
                <p className="admin-message" role="status">
                    {actionMessage}
                </p>
            )}

            {actionError && (
                <p className="admin-error" role="alert">
                    {actionError}
                </p>
            )}

            {/* Dashboard summary */}
            <section className="admin-stats">
                <article>
                    <span>Total customers</span>
                    <strong>{customers.length}</strong>
                </article>

                <article>
                    <span>Shop owners</span>
                    <strong>{owners.length}</strong>
                </article>

                <article>
                    <span>Total orders</span>
                    <strong>{orders.length}</strong>
                </article>
            </section>

            {/* Customers */}
            <section className="admin-panel">
                <h2>Customers</h2>

                <input
                    type="search"
                    value={customerSearch}
                    onChange={(event) => setCustomerSearch(event.target.value)}
                    placeholder="Search by customer name, email, phone or ID"
                    className="admin-search"
                    aria-label="Search customers"
                />

                <p>
                    Showing {filteredCustomers.length} of {customers.length} customers
                </p>

                {filteredCustomers.length === 0 ? (
                    <p>
                        {customers.length === 0
                            ? 'No customers registered yet.'
                            : 'No customers match your search.'}
                    </p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.customerId}>
                                        <td>{customer.customerId}</td>
                                        <td>{customer.fullName}</td>
                                        <td>{customer.email || '—'}</td>
                                        <td>{customer.phone || '—'}</td>
                                        <td>
                                            {customer.createdAt
                                                ? new Date(customer.createdAt).toLocaleDateString()
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Shop owners */}
            <section className="admin-panel">
                <h2>Shop owners</h2>

                <div className="admin-toolbar">
                    <input
                        type="search"
                        value={ownerSearch}
                        onChange={(event) => setOwnerSearch(event.target.value)}
                        placeholder="Search owner, username, phone, email or shop"
                        className="admin-search"
                        aria-label="Search shop owners"
                    />

                    <select
                        value={ownerFilter}
                        onChange={(event) => setOwnerFilter(event.target.value)}
                        className="admin-search-filter"
                        aria-label="Filter shop owners"
                    >
                        <option value="all">All owners</option>
                        <option value="enabled">Active owner and shop</option>
                        <option value="pending">Pending owner account</option>
                        <option value="disabled">Enabled owner, inactive shop</option>
                    </select>
                </div>

                <p>
                    Showing {filteredOwners.length} of {owners.length} shop owners
                </p>

                {filteredOwners.length === 0 ? (
                    <p>
                        {owners.length === 0
                            ? 'No shop owners registered yet.'
                            : 'No shop owners match your search or filter.'}
                    </p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Username</th>
                                    <th>Shop</th>
                                    <th>Phone</th>
                                    <th>Account</th>
                                    <th>Shop status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredOwners.map((owner) => (
                                    <tr key={owner.ownerId}>
                                        <td>{owner.ownerId}</td>
                                        <td>{owner.ownerName}</td>
                                        <td>{owner.username}</td>
                                        <td>{owner.shopName || 'No shop linked'}</td>
                                        <td>{owner.phone || '—'}</td>

                                        <td>
                                            <span
                                                className={`admin-status ${
                                                    owner.enabled ? 'active' : 'pending'
                                                }`}
                                            >
                                                {owner.enabled ? 'Enabled' : 'Pending'}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`admin-status ${
                                                    owner.shopActive ? 'active' : 'pending'
                                                }`}
                                            >
                                                {owner.shopActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                disabled={
                                                    activatingOwnerId === owner.ownerId ||
                                                    !owner.shopId
                                                }
                                                onClick={() => toggleShopStatus(owner)}
                                            >
                                                {activatingOwnerId === owner.ownerId
                                                    ? 'Updating...'
                                                    : owner.shopActive
                                                        ? 'Disable Shop'
                                                        : 'Activate Shop'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Print orders */}
            <section className="admin-panel">
                <h2>Print orders</h2>

                <div className="admin-toolbar admin-order-toolbar">
                    <input
                        type="search"
                        value={orderSearch}
                        onChange={(event) => setOrderSearch(event.target.value)}
                        placeholder="Search order, customer, phone or shop"
                        className="admin-search"
                        aria-label="Search print orders"
                    />

                    <select
                        value={orderFilter}
                        onChange={(event) => setOrderFilter(event.target.value)}
                        className="admin-search-filter"
                        aria-label="Filter orders by status"
                    >
                        <option value="all">All order statuses</option>
                        {orderStatuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>

                    <label className="admin-date-filter">
                        <span>From date</span>
                        <input
                            type="date"
                            value={orderStartDate}
                            max={orderEndDate || undefined}
                            onChange={(event) => setOrderStartDate(event.target.value)}
                        />
                    </label>

                    <label className="admin-date-filter">
                        <span>To date</span>
                        <input
                            type="date"
                            value={orderEndDate}
                            min={orderStartDate || undefined}
                            onChange={(event) => setOrderEndDate(event.target.value)}
                        />
                    </label>

                    <select
                        value={orderSort}
                        onChange={(event) => setOrderSort(event.target.value)}
                        className="admin-search-filter"
                        aria-label="Sort orders by date"
                    >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                    </select>

                    <button
                        type="button"
                        onClick={() => {
                            setOrderSearch('')
                            setOrderFilter('all')
                            setOrderStartDate('')
                            setOrderEndDate('')
                            setOrderSort('newest')
                        }}
                    >
                        Clear filters
                    </button>
                </div>

                <p>
                    Showing {filteredOrders.length} of {orders.length} orders
                </p>

                {filteredOrders.length === 0 ? (
                    <p>
                        {orders.length === 0
                            ? 'No print orders yet.'
                            : 'No orders match your search, status or date range.'}
                    </p>
                ) : (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Order number</th>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Shop</th>
                                    <th>Amount</th>
                                    <th>Order status</th>
                                    <th>Payment</th>
                                    <th>Created</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.orderId}>
                                        <td>{order.orderId}</td>
                                        <td>{order.orderNumber || order.orderId}</td>
                                        <td>{order.customerName || 'Unknown'}</td>
                                        <td>{order.customerPhone || '—'}</td>
                                        <td>{order.shopName || '—'}</td>
                                        <td>
                                            ₹{Number(order.totalAmount || 0).toFixed(2)}
                                        </td>
                                        <td>{order.orderStatus || '—'}</td>
                                        <td>{order.paymentStatus || '—'}</td>
                                        <td>
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleString()
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </main>
    )
}
