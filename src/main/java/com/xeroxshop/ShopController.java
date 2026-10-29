
package com.xeroxshop;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/shops")
public class ShopController {

    private final ShopRepository shopRepository;
    private final ShopOwnerRepository shopOwnerRepository;
    private final PasswordEncoder passwordEncoder;
    private final String registrationCode;

    public ShopController(
            ShopRepository shopRepository,
            ShopOwnerRepository shopOwnerRepository,
            PasswordEncoder passwordEncoder,
            @Value("${shop.registration.verification-code}")
            String registrationCode) {

        this.shopRepository = shopRepository;
        this.shopOwnerRepository = shopOwnerRepository;
        this.passwordEncoder = passwordEncoder;
        this.registrationCode = registrationCode;
    }

    // Customers can view active shops only.
    @GetMapping
    public List<Shop> getAllShops() {
        return shopRepository
                .findAllByIsActiveTrueOrderByShopNameAsc();
    }

    // Register a shop and its owner together.
    @PostMapping
    @Transactional
    public Shop createShop(@RequestBody CreateShopRequest request) {

        if (request == null
                || request.verificationCode() == null
                || registrationCode == null
                || registrationCode.isBlank()
                || !MessageDigest.isEqual(
                    request.verificationCode()
                            .getBytes(StandardCharsets.UTF_8),
                    registrationCode.getBytes(StandardCharsets.UTF_8))) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid registration verification code");
        }

        if (isBlank(request.shopName())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Shop name is required");
        }

        if (isBlank(request.ownerName())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Owner name is required");
        }

        if (isBlank(request.username())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username is required");
        }

        if (isBlank(request.password()) || request.password().length() < 8) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must contain at least 8 characters");
        }

        if (isBlank(request.ownerPhone())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Owner phone number is required");
        }

        String username = request.username().trim();

        if (shopOwnerRepository.existsByUsername(username)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This username is already registered");
        }

        // Create the shop, but keep it hidden from customers
        // until an administrator activates it.
        Shop shop = new Shop();
        shop.setShopName(request.shopName().trim());
        shop.setAddress(request.address());
        shop.setPhone(request.shopPhone());
        shop.setPhotoUrl(request.photoUrl());
        shop.setIsActive(false);
        shop.setCreatedAt(LocalDateTime.now());

        shop = shopRepository.save(shop);

        // Create the associated owner account.
        ShopOwner owner = new ShopOwner();
        owner.setOwnerName(request.ownerName().trim());
        owner.setUsername(username);
        owner.setPasswordHash(
                passwordEncoder.encode(request.password()));
        owner.setPhone(request.ownerPhone().trim());
        owner.setEmail(request.email());
        owner.setShop(shop);
        owner.setEnabled(false);
        owner.setCreatedAt(LocalDateTime.now());

        shopOwnerRepository.save(owner);

        // Never return the password or verification code.
        return shop;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public record CreateShopRequest(
            String shopName,
            String address,
            String shopPhone,
            String photoUrl,
            String ownerName,
            String username,
            String password,
            String ownerPhone,
            String email,
            String verificationCode) {
    }
}
