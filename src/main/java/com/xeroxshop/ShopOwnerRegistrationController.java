
package com.xeroxshop;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/owner-registration")
public class ShopOwnerRegistrationController {

    private final ShopRepository shopRepository;
    private final ShopOwnerRepository shopOwnerRepository;
    private final PasswordEncoder passwordEncoder;
    private final String registrationCode;

    private static final Pattern OWNER_NAME =
            Pattern.compile("^[\\p{L}\\p{M} .'-]{3,100}$");

    private static final Pattern USERNAME =
            Pattern.compile("^[a-zA-Z0-9._-]{4,30}$");

    private static final Pattern PHONE =
            Pattern.compile("^(?:\\+91|91)?[6-9][0-9]{9}$");

    private static final Pattern EMAIL =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    public ShopOwnerRegistrationController(
            ShopRepository shopRepository,
            ShopOwnerRepository shopOwnerRepository,
            PasswordEncoder passwordEncoder,
            @Value("${shop.registration.verification-code:}")
            String registrationCode) {

        this.shopRepository = shopRepository;
        this.shopOwnerRepository = shopOwnerRepository;
        this.passwordEncoder = passwordEncoder;
        this.registrationCode = registrationCode;
    }

    @PostMapping
    @Transactional
    public RegistrationResponse register(
            @RequestBody RegistrationRequest request) {

        if (request == null) {
            throw badRequest("Registration details are required.");
        }

        validateVerificationCode(request.verificationCode());

        String ownerName = trim(request.ownerName());
        String shopName = trim(request.shopName());
        String address = trim(request.address());
        String ownerPhone = trim(request.ownerPhone());
        String shopPhone = trim(request.shopPhone());
        String email = trim(request.email());
        String photoUrl = trim(request.photoUrl());
        String username = trim(request.username());
        String password = request.password();

        validateOwnerName(ownerName);
        validateShopName(shopName);
        validateAddress(address);
        validatePhone(ownerPhone, "Owner mobile number", true);
        validatePhone(shopPhone, "Shop phone number", false);
        validateEmail(email);
        validatePhotoUrl(photoUrl);
        validateUsername(username);
        validatePassword(password);

        if (shopOwnerRepository.existsByUsername(username)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This username is already registered.");
        }

        LocalDateTime now = LocalDateTime.now();

        Shop shop = new Shop();
        shop.setShopName(shopName);
        shop.setAddress(emptyToNull(address));
        shop.setPhone(emptyToNull(shopPhone));
        shop.setPhotoUrl(emptyToNull(photoUrl));
        shop.setIsActive(false);
        shop.setCreatedAt(now);

        shop = shopRepository.save(shop);

        ShopOwner owner = new ShopOwner();
        owner.setOwnerName(ownerName);
        owner.setUsername(username);
        owner.setPasswordHash(passwordEncoder.encode(password));
        owner.setPhone(ownerPhone);
        owner.setEmail(emptyToNull(email));
        owner.setShop(shop);
        owner.setEnabled(false);
        owner.setCreatedAt(now);

        owner = shopOwnerRepository.save(owner);

        return new RegistrationResponse(
                "Registration submitted. Await administrator approval.",
                shop.getShopId(),
                shop.getShopName(),
                owner.getOwnerId(),
                owner.getUsername(),
                true
        );
    }

    private void validateVerificationCode(String suppliedCode) {
        if (suppliedCode == null
                || registrationCode == null
                || registrationCode.isBlank()
                || !MessageDigest.isEqual(
                        suppliedCode.getBytes(StandardCharsets.UTF_8),
                        registrationCode.getBytes(StandardCharsets.UTF_8))) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid registration verification code.");
        }
    }

    private void validateOwnerName(String name) {
        if (name == null || !OWNER_NAME.matcher(name).matches()) {
            throw badRequest(
                    "Owner name must be 3–100 characters and contain only letters, spaces, dots, apostrophes or hyphens.");
        }
    }

    private void validateShopName(String name) {
        if (name == null || name.length() < 2 || name.length() > 150) {
            throw badRequest(
                    "Shop name must contain between 2 and 150 characters.");
        }
    }

    private void validateAddress(String address) {
        if (address == null || address.length() < 5
                || address.length() > 255) {
            throw badRequest(
                    "Shop address must contain between 5 and 255 characters.");
        }
    }

    private void validatePhone(
            String phone, String fieldName, boolean required) {

        if (phone == null || phone.isBlank()) {
            if (required) {
                throw badRequest(fieldName + " is required.");
            }
            return;
        }

        String normalized = phone.replaceAll("[\\s()-]", "");

        if (!PHONE.matcher(normalized).matches()) {
            throw badRequest(
                    fieldName + " must be a valid Indian mobile number.");
        }
    }

    private void validateEmail(String email) {
        if (email != null && !email.isBlank()) {
            if (email.length() > 150
                    || !EMAIL.matcher(email).matches()) {
                throw badRequest("Please enter a valid email address.");
            }
        }
    }

    private void validatePhotoUrl(String photoUrl) {
        if (photoUrl == null || photoUrl.isBlank()) {
            return;
        }

        if (photoUrl.length() > 500) {
            throw badRequest("Shop photo URL cannot exceed 500 characters.");
        }

        try {
            URI uri = URI.create(photoUrl);

            String scheme = uri.getScheme();

            if (scheme == null
                    || !(scheme.equalsIgnoreCase("http")
                    || scheme.equalsIgnoreCase("https"))
                    || uri.getHost() == null
                    || uri.getHost().isBlank()) {

                throw badRequest(
                        "Shop photo URL must be a valid HTTP or HTTPS URL.");
            }
        } catch (IllegalArgumentException ex) {
            throw badRequest("Please enter a valid shop photo URL.");
        }
    }

    private void validateUsername(String username) {
        if (username == null
                || !USERNAME.matcher(username).matches()) {
            throw badRequest(
                    "Username must be 4–30 characters and contain only letters, numbers, dots, underscores or hyphens.");
        }
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw badRequest(
                    "Password must contain at least 8 characters.");
        }

        if (password.length() > 128) {
            throw badRequest(
                    "Password cannot exceed 128 characters.");
        }

        if (!password.matches(".*[A-Z].*")) {
            throw badRequest(
                    "Password must contain an uppercase letter.");
        }

        if (!password.matches(".*[a-z].*")) {
            throw badRequest(
                    "Password must contain a lowercase letter.");
        }

        if (!password.matches(".*[0-9].*")) {
            throw badRequest(
                    "Password must contain a number.");
        }

        if (!password.matches(".*[^A-Za-z0-9].*")) {
            throw badRequest(
                    "Password must contain a special character.");
        }
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST, message);
    }

    public record RegistrationRequest(
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

    public record RegistrationResponse(
            String message,
            Long shopId,
            String shopName,
            Long ownerId,
            String username,
            boolean pendingApproval) {
    }
}
