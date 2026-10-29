
package com.xeroxshop;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "shops")
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shop_id")
    private Long shopId;

    @Column(name = "shop_name", nullable = false, length = 150)
    private String shopName;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "phone", length = 20)
    private String phone;
    @Column(name = "photo_url", length = 500)
    private String photoUrl;
 
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "razorpay_payment_link", length = 1000)
private String razorpayPaymentLink;


    public Shop() {
    }

    public Long getShopId() {
        return shopId;
    }
public String getRazorpayPaymentLink() {
    return razorpayPaymentLink;
}

public void setRazorpayPaymentLink(String razorpayPaymentLink) {
    this.razorpayPaymentLink = razorpayPaymentLink;
}
    public void setShopId(Long shopId) {
        this.shopId = shopId;
    }

    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public String getPhotoUrl() {
    return photoUrl;
}

public void setPhotoUrl(String photoUrl) {
    this.photoUrl = photoUrl;
}

}
