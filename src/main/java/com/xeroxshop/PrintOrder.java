
package com.xeroxshop;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "print_orders")
public class PrintOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "order_number", nullable = false, unique = true, length = 40)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    // Registered customer: nullable for guest orders
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    // Guest customer: separate table and separate ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_customer_id")
    private GuestCustomer guestCustomer;

    @Column(name = "page_count", nullable = false)
    private Integer pageCount = 1;

    @Column(name = "copies", nullable = false)
    private Integer copies = 1;

    @Column(name = "color_mode", nullable = false, length = 20)
    private String colorMode = "BLACK_WHITE";

    @Column(name = "print_sides", nullable = false, length = 20)
    private String printSides = "SINGLE";

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "pickup_at")
    private LocalDateTime pickupAt;

    @Column(name = "order_status", nullable = false, length = 30)
    private String orderStatus = "PENDING";

    @Column(name = "payment_status", nullable = false, length = 20)
    private String paymentStatus = "UNPAID";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public PrintOrder() {
    }

    @PrePersist
    public void prepareOrder() {
        if (orderNumber == null || orderNumber.isBlank()) {
            orderNumber = "XRX-" + UUID.randomUUID();
        }

        if (orderStatus == null) {
            orderStatus = "PENDING";
        }

        if (paymentStatus == null) {
            paymentStatus = "UNPAID";
        }

        // An order must belong to exactly one customer type.
        if ((customer == null && guestCustomer == null)
                || (customer != null && guestCustomer != null)) {
            throw new IllegalStateException(
                "An order must have exactly one registered or guest customer."
            );
        }

        // Registered customers must schedule pickup.
        if (customer != null && pickupAt == null) {
            throw new IllegalStateException(
                "Pickup date and time are required for registered customers."
            );
        }
    }

    public Long getOrderId() {
        return orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public Shop getShop() {
        return shop;
    }

    public void setShop(Shop shop) {
        this.shop = shop;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public GuestCustomer getGuestCustomer() {
        return guestCustomer;
    }

    public void setGuestCustomer(GuestCustomer guestCustomer) {
        this.guestCustomer = guestCustomer;
    }

    public Integer getPageCount() {
        return pageCount;
    }

    public void setPageCount(Integer pageCount) {
        this.pageCount = pageCount;
    }

    public Integer getCopies() {
        return copies;
    }

    public void setCopies(Integer copies) {
        this.copies = copies;
    }

    public String getColorMode() {
        return colorMode;
    }

    public void setColorMode(String colorMode) {
        this.colorMode = colorMode;
    }

    public String getPrintSides() {
        return printSides;
    }

    public void setPrintSides(String printSides) {
        this.printSides = printSides;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDateTime getPickupAt() {
        return pickupAt;
    }

    public void setPickupAt(LocalDateTime pickupAt) {
        this.pickupAt = pickupAt;
    }

    public String getOrderStatus() {
        return orderStatus;
    }
    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
