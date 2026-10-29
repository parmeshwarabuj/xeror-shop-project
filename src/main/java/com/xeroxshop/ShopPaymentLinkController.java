
package com.xeroxshop;

import java.net.URI;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/owner/payment-link")
@CrossOrigin(origins = "http://localhost:5173")
public class ShopPaymentLinkController {

    private final ShopOwnerRepository shopOwnerRepository;

    public ShopPaymentLinkController(
            ShopOwnerRepository shopOwnerRepository) {
        this.shopOwnerRepository = shopOwnerRepository;
    }

    public record PaymentLinkRequest(String paymentLink) {}
    public record PaymentLinkResponse(
            Long shopId,
            String shopName,
            String paymentLink) {}

    private ShopOwner getOwner(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Please log in");
        }

        ShopOwner owner = shopOwnerRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Shop owner not found"));

        if (!owner.isEnabled()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Shop owner account is disabled");
        }

        return owner;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public PaymentLinkResponse getPaymentLink(
            Authentication authentication) {

        Shop shop = getOwner(authentication).getShop();

        return new PaymentLinkResponse(
                shop.getShopId(),
                shop.getShopName(),
                shop.getRazorpayPaymentLink());
    }

    @PutMapping
    @Transactional
    public PaymentLinkResponse savePaymentLink(
            @RequestBody PaymentLinkRequest request,
            Authentication authentication) {

        Shop shop = getOwner(authentication).getShop();

        if (request == null || request.paymentLink() == null
                || request.paymentLink().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Payment link is required");
        }

        String link = request.paymentLink().trim();

        try {
            URI uri = URI.create(link);

            if (!"https".equalsIgnoreCase(uri.getScheme())
                    || uri.getHost() == null
                    || !(uri.getHost().equalsIgnoreCase("rzp.io")
                    || uri.getHost().equalsIgnoreCase("razorpay.com")
                    || uri.getHost().toLowerCase().endsWith(".razorpay.com"))) {
                throw new IllegalArgumentException("Invalid payment link");
            }
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Enter a valid HTTPS Razorpay Payment Link");
        }

        if (link.length() > 1000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Payment link is too long");
        }

        if (shop.getRazorpayPaymentLink() != null
                && !shop.getRazorpayPaymentLink().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A payment link has already been saved for this shop");
        }

        shop.setRazorpayPaymentLink(link);

        return new PaymentLinkResponse(
                shop.getShopId(),
                shop.getShopName(),
                shop.getRazorpayPaymentLink());
    }
}
