
package com.xeroxshop;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
public class MainAdminController {

    private final CustomerRepository customerRepository;
    private final PrintOrderRepository printOrderRepository;
    private final ShopOwnerRepository shopOwnerRepository;

    public MainAdminController(
            CustomerRepository customerRepository,
            PrintOrderRepository printOrderRepository,
            ShopOwnerRepository shopOwnerRepository) {
        this.customerRepository = customerRepository;
        this.printOrderRepository = printOrderRepository;
        this.shopOwnerRepository = shopOwnerRepository;
    }

@GetMapping("/dashboard")
@Transactional(readOnly = true)
public Map<String, Object> getDashboard(
            org.springframework.security.core.Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getAuthorities().stream()
                    .noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Admin access required");
        }

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("customers", customerRepository.findAll().stream()
                .map(c -> Map.of(
                        "customerId", c.getCustomerId(),
                        "fullName", c.getFullName(),
                        "email", c.getEmail() == null ? "" : c.getEmail(),
                        "phone", c.getPhone() == null ? "" : c.getPhone(),
                        "createdAt", c.getCreatedAt() == null
                                ? "" : c.getCreatedAt().toString()))
                .collect(Collectors.toList()));

        result.put("shopOwners", shopOwnerRepository.findAll().stream()
                .map(o -> {
                    Map<String, Object> owner = new LinkedHashMap<>();
                    owner.put("ownerId", o.getOwnerId());
                    owner.put("ownerName", o.getOwnerName());
                    owner.put("username", o.getUsername());
                    owner.put("phone", o.getPhone());
                    owner.put("email", o.getEmail());
                    owner.put("enabled", o.isEnabled());
                    owner.put("shopId", o.getShop() == null
                            ? null : o.getShop().getShopId());
                    owner.put("shopName", o.getShop() == null
                            ? "" : o.getShop().getShopName());
                    owner.put("shopActive", o.getShop() != null
                            && Boolean.TRUE.equals(o.getShop().getIsActive()));
                    return owner;
                })
                .collect(Collectors.toList()));

        result.put("orders", printOrderRepository
                .findAllByOrderByOrderIdDesc().stream()
                .map(o -> {
                    Map<String, Object> order = new LinkedHashMap<>();
                    order.put("orderId", o.getOrderId());
                    order.put("orderNumber", o.getOrderNumber());
                    order.put("shopId", o.getShop() == null
                            ? null : o.getShop().getShopId());
                    order.put("shopName", o.getShop() == null
                            ? "" : o.getShop().getShopName());
                    order.put("customerName", o.getCustomer() != null
                            ? o.getCustomer().getFullName()
                            : o.getGuestCustomer() != null
                                ? o.getGuestCustomer().getName() : "Unknown");
                    order.put("customerPhone", o.getCustomer() != null
                            ? o.getCustomer().getPhone()
                            : o.getGuestCustomer() != null
                                ? o.getGuestCustomer().getPhone() : "");
                    order.put("totalAmount", o.getTotalAmount());
                    order.put("orderStatus", String.valueOf(o.getOrderStatus()));
                    order.put("paymentStatus", String.valueOf(o.getPaymentStatus()));
                    order.put("createdAt", o.getCreatedAt() == null
                            ? "" : o.getCreatedAt().toString());
                    return order;
                })
                .collect(Collectors.toList()));

        return result;
    }
}
