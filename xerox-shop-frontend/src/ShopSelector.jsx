
import './ShopSelector.css'

export default function ShopSelector({
  shops,
  selectedShopId,
  onSelectShop,
  loading,
  error,
  onRetry,
  disabled = false,
}) {
  if (loading) {
    return (
      <section className="shop-selector">
        <h3>Choose a print shop</h3>
        <p>Loading available shops...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="shop-selector">
        <h3>Choose a print shop</h3>
        <p className="shop-selector-error">{error}</p>
        <button
          type="button"
          className="shop-retry-button"
          onClick={onRetry}
        >
          Retry
        </button>
      </section>
    )
  }

  if (!shops || shops.length === 0) {
    return (
      <section className="shop-selector">
        <h3>Choose a print shop</h3>
        <p>No active shops are available right now.</p>
      </section>
    )
  }

  return (
    <section className="shop-selector">
      <div className="shop-selector-heading">
        <h3>Choose a print shop *</h3>
        <p>View shop details and select where you want to print.</p>
      </div>

      <div className="shop-card-grid">
        {shops.map((shop) => {
          const shopId = String(shop.shopId)
          const isSelected = shopId === String(selectedShopId)

          return (
            <button
              type="button"
              key={shopId}
              className={`shop-card ${isSelected ? 'shop-card-selected' : ''}`}
              onClick={() => onSelectShop(shopId)}
              disabled={disabled}
              aria-pressed={isSelected}
            >
              {shop.photoUrl ? (
                <img
                  className="shop-card-image"
                  src={shop.photoUrl}
                  alt={`${shop.shopName} shop`}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                    event.currentTarget.nextElementSibling?.classList.remove(
                      'shop-image-fallback-hidden'
                    )
                  }}
                />
              ) : null}

              <div
                className={`shop-image-fallback ${
                  shop.photoUrl ? 'shop-image-fallback-hidden' : ''
                }`}
              >
                <span aria-hidden="true">🏪</span>
                <span>Shop photo unavailable</span>
              </div>

              <div className="shop-card-content">
           
<div className="shop-card-title-row">
  <div>
    <h4>{shop.shopName || 'Print Shop'}</h4>
    <p className="shop-card-id">
      Shop ID: {shop.shopId}
    </p>
  </div>

  <span
    className={`shop-selection-indicator ${
      isSelected ? 'shop-selection-indicator-active' : ''
    }`}
    aria-hidden="true"
  >
    {isSelected ? '✓' : ''}
  </span>
</div>


                <p className="shop-card-detail">
                  <span aria-hidden="true">📍</span>
                  <span>{shop.address || 'Address not provided'}</span>
                </p>

                <p className="shop-card-detail">
                  <span aria-hidden="true">📞</span>
                  <span>{shop.phone || 'Phone number not provided'}</span>
                </p>

                <span
                  className={`shop-card-action ${
                    isSelected ? 'shop-card-action-selected' : ''
                  }`}
                >
                  {isSelected ? 'Selected shop' : 'Select this shop'}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {!selectedShopId && (
        <p className="shop-selection-hint">
          Select a shop before placing your order.
        </p>
      )}
    </section>
  )
}
