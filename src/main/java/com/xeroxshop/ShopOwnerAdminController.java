package com.xeroxshop;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin/shop-owners")
public class ShopOwnerAdminController {

    private final ShopOwnerRepository shopOwnerRepository;
    private final ShopRepository shopRepository;

    public ShopOwnerAdminController(
            ShopOwnerRepository shopOwnerRepository,
            ShopRepository shopRepository) {
        this.shopOwnerRepository = shopOwnerRepository;
        this.shopRepository = shopRepository;
    }

    @PutMapping("/{ownerId}/activate")
    @Transactional
    public ActivationResponse activateOwner(@PathVariable Long ownerId) {
        ShopOwner owner = findOwner(ownerId);
        Shop shop = findShop(owner);

        owner.setEnabled(true);
        shop.setIsActive(true);

        shopRepository.save(shop);
        shopOwnerRepository.save(owner);

        return response("Shop activated successfully", owner, shop);
    }

    @PutMapping("/{ownerId}/deactivate")
    @Transactional
    public ActivationResponse deactivateOwner(@PathVariable Long ownerId) {
        ShopOwner owner = findOwner(ownerId);
        Shop shop = findShop(owner);

        // Keep the owner account enabled; only deactivate the shop.
        shop.setIsActive(false);

        shopRepository.save(shop);

        return response("Shop deactivated successfully", owner, shop);
    }

    private ShopOwner findOwner(Long ownerId) {
        return shopOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Shop owner not found"));
    }

    private Shop findShop(ShopOwner owner) {
        Shop shop = owner.getShop();

        if (shop == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This owner has no associated shop");
        }

        return shop;
    }

    private ActivationResponse response(
            String message, ShopOwner owner, Shop shop) {
        return new ActivationResponse(
                message,
                owner.getOwnerId(),
                owner.getUsername(),
                shop.getShopId(),
                shop.getShopName(),
                owner.isEnabled(),
                Boolean.TRUE.equals(shop.getIsActive())
        );
    }

    public record ActivationResponse(
            String message,
            Long ownerId,
            String username,
            Long shopId,
            String shopName,
            boolean ownerEnabled,
            boolean shopActive
    ) {}
}