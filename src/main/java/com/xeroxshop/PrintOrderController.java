
package com.xeroxshop;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/orders")
public class PrintOrderController {

    private final PrintOrderRepository orderRepository;
    private final ShopRepository shopRepository;
    private final CustomerRepository customerRepository;
    private final GuestCustomerRepository guestCustomerRepository;
    private final PrintPricingRepository pricingRepository;
    private final ShopOwnerRepository shopOwnerRepository;

    public PrintOrderController(
            PrintOrderRepository orderRepository,
            ShopRepository shopRepository,
            CustomerRepository customerRepository,
            GuestCustomerRepository guestCustomerRepository,
            PrintPricingRepository pricingRepository,
            ShopOwnerRepository shopOwnerRepository) {

        this.orderRepository = orderRepository;
        this.shopRepository = shopRepository;
        this.customerRepository = customerRepository;
        this.guestCustomerRepository = guestCustomerRepository;
        this.pricingRepository = pricingRepository;
        this.shopOwnerRepository = shopOwnerRepository;
    }

    public record CreateOrderRequest(
            Long shopId,
            Long customerId,
            String guestName,
            String guestPhone,
            Integer pageCount,
            Integer copies,
            String colorMode,
            String printSides,
            LocalDateTime pickupAt) {
    }

    public record OrderResponse(
            Long orderId,
            String orderNumber,
            Long shopId,
            Long customerId,
            Long guestCustomerId,
            String customerName,
            String customerPhone,
            Integer pageCount,
            Integer copies,
            String colorMode,
            String printSides,
            BigDecimal totalAmount,
            LocalDateTime pickupAt,
            String orderStatus,
            String paymentStatus) {
    }

    public record StatusUpdateRequest(String status) {
    }

    // Create an order for the selected shop.
    @PostMapping
    @Transactional
    public OrderResponse createOrder(
            @RequestBody CreateOrderRequest request) {

        boolean registered = request.customerId() != null;

        boolean guest = request.guestName() != null
                && !request.guestName().isBlank()
                && request.guestPhone() != null
                && !request.guestPhone().isBlank();

        if (request.shopId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Shop ID is required");
        }

        if (registered == guest) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Provide either a registered customer ID or guest name and phone");
        }

        if (registered && request.pickupAt() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Pickup time is required for registered customers");
        }

        if (request.pickupAt() != null
                && !request.pickupAt().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Pickup time must be in the future");
        }

        Shop shop = shopRepository.findById(request.shopId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Shop not found"));

        if (!Boolean.TRUE.equals(shop.getIsActive())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "This shop is not active");
        }

        Customer customer = null;
        GuestCustomer guestCustomer = null;

        if (registered) {
            customer = customerRepository.findById(request.customerId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Customer not found"));
        } else {
            String name = request.guestName().trim();
            String phone = request.guestPhone().trim();

            if (name.length() > 100 || phone.length() > 15) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Guest name must be at most 100 characters and phone at most 15");
            }

            guestCustomer = new GuestCustomer();
            guestCustomer.setName(name);
            guestCustomer.setPhone(phone);
            guestCustomer = guestCustomerRepository.save(guestCustomer);
        }

        int pages = request.pageCount() == null ? 1 : request.pageCount();
        int copies = request.copies() == null ? 1 : request.copies();

        if (pages < 1 || copies < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page count and copies must be at least 1");
        }

        String colorMode = request.colorMode() == null
                ? "BLACK_WHITE"
                : request.colorMode().trim().toUpperCase(Locale.ROOT);

        if (!colorMode.equals("BLACK_WHITE")
                && !colorMode.equals("COLOR")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Color mode must be BLACK_WHITE or COLOR");
        }

        String printSides = request.printSides() == null
                ? "SINGLE"
                : request.printSides().trim().toUpperCase(Locale.ROOT);

        if (!printSides.equals("SINGLE") && !printSides.equals("DOUBLE")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Print sides must be SINGLE or DOUBLE");
        }

        PrintPricing pricing = pricingRepository
                .findByShop_ShopIdAndColorModeAndPrintSidesAndIsActiveTrue(
                        shop.getShopId(), colorMode, printSides)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "No active pricing found for this print option"));

        String expectedBillingUnit =
                printSides.equals("SINGLE") ? "SIDE" : "SHEET";

        if (!expectedBillingUnit.equalsIgnoreCase(pricing.getBillingUnit())) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Pricing configuration has an incorrect billing unit");
        }

        long billableUnits;

        if (printSides.equals("SINGLE")) {
            billableUnits = (long) pages * copies;
        } else {
            long sheetsPerCopy = (pages + 1L) / 2L;
            billableUnits = sheetsPerCopy * copies;
        }

        BigDecimal totalAmount = pricing.getPricePerUnit()
                .multiply(BigDecimal.valueOf(billableUnits))
                .setScale(2);

        PrintOrder order = new PrintOrder();
        order.setShop(shop);
        order.setCustomer(customer);
        order.setGuestCustomer(guestCustomer);
        order.setPageCount(pages);
        order.setCopies(copies);
        order.setColorMode(colorMode);
        order.setPrintSides(printSides);
        order.setTotalAmount(totalAmount);
        order.setPickupAt(request.pickupAt());

        PrintOrder saved = orderRepository.save(order);

        return toResponse(saved);
    }

    // Get an order by ID.
    @GetMapping("/{orderId}")
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(
            @PathVariable Long orderId) {

        PrintOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"));

        return toResponse(order);
    }

    // Update status only for administrators or the order's own shop owner.
    @PutMapping("/{orderId}/status")
    @Transactional
    public OrderResponse updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody StatusUpdateRequest request,
            Authentication authentication) {

        if (request == null || request.status() == null
                || request.status().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Order status is required");
        }

        String newStatus = request.status()
                .trim()
                .toUpperCase(Locale.ROOT);

        List<String> allowedStatuses = List.of(
                "PENDING", "PRINTING", "READY",
                "COMPLETED", "CANCELLED");

        if (!allowedStatuses.contains(newStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid order status");
        }

        PrintOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"));

        boolean isAdmin = authentication != null
                && authentication.getAuthorities().stream()
                        .anyMatch(authority ->
                                authority.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            if (authentication == null) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Please log in");
            }

            ShopOwner owner = shopOwnerRepository
                    .findByUsername(authentication.getName())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.FORBIDDEN,
                            "Shop owner account not found"));

            if (!owner.isEnabled()
                    || !owner.getShop().getShopId()
                            .equals(order.getShop().getShopId())) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You cannot update orders belonging to another shop");
            }
        }

        String currentStatus = order.getOrderStatus();

        if ("COMPLETED".equals(currentStatus)
                || "CANCELLED".equals(currentStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Completed or cancelled orders cannot be changed");
        }

        boolean validTransition =
                ("PENDING".equals(currentStatus)
                        && ("PRINTING".equals(newStatus)
                        || "CANCELLED".equals(newStatus)))
                || ("PRINTING".equals(currentStatus)
                        && ("READY".equals(newStatus)
                        || "CANCELLED".equals(newStatus)))
                || ("READY".equals(currentStatus)
                        && ("COMPLETED".equals(newStatus)
                        || "CANCELLED".equals(newStatus)));

        if (!validTransition) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invalid status transition from "
                            + currentStatus + " to " + newStatus);
        }

        order.setOrderStatus(newStatus);

        PrintOrder saved = orderRepository.save(order);

        return toResponse(saved);
    }

    // Administrators see all orders; owners see only their own shop's orders.
    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders(
            Authentication authentication) {

        if (authentication == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Please log in");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            return orderRepository.findAllByOrderByOrderIdDesc()
                    .stream()
                    .map(this::toResponse)
                    .toList();
        }

        ShopOwner owner = shopOwnerRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Shop owner account not found"));

        if (!owner.isEnabled()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Shop owner account is disabled");
        }

        return orderRepository
                .findAllByShop_ShopIdOrderByOrderIdDesc(
                        owner.getShop().getShopId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private OrderResponse toResponse(PrintOrder order) {

        Customer customer = order.getCustomer();
        GuestCustomer guest = order.getGuestCustomer();

        String customerName = guest != null
                ? guest.getName()
                : customer != null ? customer.getFullName() : null;

        String customerPhone = guest != null
                ? guest.getPhone()
                : null;

        return new OrderResponse(
                order.getOrderId(),
                order.getOrderNumber(),
                order.getShop().getShopId(),
                customer != null ? customer.getCustomerId() : null,
                guest != null ? guest.getCustomerId() : null,
                customerName,
                customerPhone,
                order.getPageCount(),
                order.getCopies(),
                order.getColorMode(),
                order.getPrintSides(),
                order.getTotalAmount(),
                order.getPickupAt(),
                order.getOrderStatus(),
                order.getPaymentStatus());
    }

    // Registered customers can view their own orders using their session.
    @GetMapping("/customer/me")
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in to view your orders");
        }

        Object customerIdValue = session.getAttribute("CUSTOMER_ID");

        if (!(customerIdValue instanceof Long)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in to view your orders");
        }

        Long customerId = (Long) customerIdValue;

        return orderRepository
                .findAllByCustomer_CustomerIdOrderByOrderIdDesc(customerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }
}
