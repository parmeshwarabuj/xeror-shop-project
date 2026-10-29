
package com.xeroxshop;

import com.razorpay.Order;
import com.razorpay.RazorpayException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings("unused")
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/payments")
public class PaymentController {

    private final RazorpayService razorpayService;
    private final PaymentRepository paymentRepository;
    private final PrintOrderRepository orderRepository;

    public PaymentController(
            PaymentRepository paymentRepository,
            PrintOrderRepository orderRepository,
            RazorpayService razorpayService) {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.razorpayService = razorpayService;
    }

    // View payments for an order
    @GetMapping("/order/{orderId}")
    public List<Map<String, Object>> getPaymentsForOrder(
            @PathVariable Long orderId) {

        if (!orderRepository.existsById(orderId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Order not found");
        }

        return paymentRepository.findByOrder_OrderId(orderId)
                .stream()
                .map(payment -> {
                    Map<String, Object> details = new LinkedHashMap<>();
                    details.put("paymentId", payment.getPaymentId());
                    details.put("orderId", orderId);
                    details.put("amount", payment.getAmount());
                    details.put("paymentMethod", payment.getPaymentMethod());
                    details.put("paymentReference", payment.getPaymentReference());
                    details.put("paymentStatus", payment.getPaymentStatus());
                    details.put("paidAt", payment.getPaidAt());
                    details.put("createdAt", payment.getCreatedAt());
                    return details;
                })
                .toList();
    }

    // Create a pending payment record for UPI, CASH, or CARD
    @PostMapping("/order/{orderId}")
    public Map<String, Object> createPayment(
            @PathVariable Long orderId,
            @RequestParam String paymentMethod) {

        PrintOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"));

        String method = paymentMethod.trim().toUpperCase();

        if (!List.of("UPI", "CASH", "CARD").contains(method)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment method must be UPI, CASH, or CARD");
        }

        if (order.getTotalAmount() == null
                || order.getTotalAmount().signum() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order total must be greater than zero");
        }

        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Order is already paid");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(method);
        payment.setPaymentStatus("PENDING");

        Payment saved = paymentRepository.save(payment);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Pending payment record created");
        response.put("paymentId", saved.getPaymentId());
        response.put("orderId", orderId);
        response.put("amount", saved.getAmount());
        response.put("paymentMethod", saved.getPaymentMethod());
        response.put("paymentStatus", saved.getPaymentStatus());

        return response;
    }

    // Retrieve a payment by its ID
    @GetMapping("/{paymentId}")
    public Map<String, Object> getPaymentById(
            @PathVariable Long paymentId) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Payment not found"));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("paymentId", payment.getPaymentId());
        response.put("orderId", payment.getOrder().getOrderId());
        response.put("amount", payment.getAmount());
        response.put("paymentMethod", payment.getPaymentMethod());
        response.put("paymentReference", payment.getPaymentReference());
        response.put("paymentStatus", payment.getPaymentStatus());
        response.put("paidAt", payment.getPaidAt());
        response.put("createdAt", payment.getCreatedAt());

        return response;
    }

    // Create a Razorpay order
    @PostMapping("/order/{orderId}/razorpay-order")
    public Map<String, Object> createRazorpayOrder(
            @PathVariable Long orderId) {

        PrintOrder printOrder = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Print order not found"));

        if (printOrder.getTotalAmount() == null
                || printOrder.getTotalAmount().signum() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order total must be greater than zero");
        }

        if ("PAID".equalsIgnoreCase(printOrder.getPaymentStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "This order has already been paid");
        }

        long amountInPaise;

        try {
            amountInPaise = printOrder.getTotalAmount()
                    .movePointRight(2)
                    .longValueExact();
        } catch (ArithmeticException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid order amount");
        }

        try {
            Order razorpayOrder = razorpayService.createOrder(
                    amountInPaise,
                    printOrder.getOrderNumber());

            String razorpayOrderId =
                    razorpayOrder.get("id").toString();

            Payment payment = new Payment();
            payment.setOrder(printOrder);
            payment.setAmount(printOrder.getTotalAmount());
            payment.setPaymentMethod("RAZORPAY");

            // Keep the Razorpay ORDER ID for verification.
            payment.setPaymentReference(razorpayOrderId);
            payment.setPaymentStatus("PENDING");

            Payment savedPayment = paymentRepository.save(payment);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("message", "Razorpay order created");
            response.put("paymentId", savedPayment.getPaymentId());
            response.put("orderId", orderId);
            response.put("amount", savedPayment.getAmount());
            response.put("currency", "INR");
            response.put("paymentMethod", "RAZORPAY");
            response.put("paymentStatus", "PENDING");
            response.put("razorpayOrderId", razorpayOrderId);
            response.put("razorpayKeyId",
                    razorpayService.getKeyId());

            return response;

        } catch (RazorpayException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Could not create Razorpay order");
        }
    }

    // Verify a Razorpay payment
    @PostMapping("/verify-razorpay")
    public ResponseEntity<?> verifyRazorpayPayment(
            @RequestBody RazorpayVerificationRequest request) {

        if (request == null
                || isBlank(request.getRazorpayOrderId())
                || isBlank(request.getRazorpayPaymentId())
                || isBlank(request.getRazorpaySignature())) {

            return ResponseEntity.badRequest().body(Map.of(
                    "message", "All Razorpay verification fields are required"));
        }

        String razorpayOrderId = request.getRazorpayOrderId();
        String razorpayPaymentId = request.getRazorpayPaymentId();
        String razorpaySignature = request.getRazorpaySignature();

        // First validate the Razorpay signature.
        if (!razorpayService.verifyPaymentSignature(
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature)) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", "Invalid Razorpay payment signature"));
        }

        // Find our pending payment using the Razorpay ORDER ID.
       Payment payment = paymentRepository
        .findByPaymentReferenceWithOrder(razorpayOrderId)
        .orElse(null);

        if (payment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", "Payment record not found"));
        }

        if (!"RAZORPAY".equalsIgnoreCase(payment.getPaymentMethod())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "This is not a Razorpay payment"));
        }

        PrintOrder order = payment.getOrder();

        if (order == null || order.getTotalAmount() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Associated order or amount is missing"));
        }

        if (payment.getAmount() == null
                || payment.getAmount().compareTo(order.getTotalAmount()) != 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Payment amount does not match the order"));
        }

        long expectedAmountInPaise;

        try {
            expectedAmountInPaise = order.getTotalAmount()
                    .movePointRight(2)
                    .longValueExact();
        } catch (ArithmeticException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid order amount"));
        }

        // Ask Razorpay to confirm the payment is captured and matches
        // this exact order, amount, and currency.
        try {
            boolean captured = razorpayService.isPaymentCapturedForOrder(
                    razorpayPaymentId,
                    razorpayOrderId,
                    expectedAmountInPaise);

            if (!captured) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "message",
                        "Razorpay payment is not captured or does not match the order"));
            }

        } catch (RazorpayException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Could not verify payment with Razorpay");
        }

        // Idempotent response for an already verified order payment.
        if ("SUCCESS".equalsIgnoreCase(payment.getPaymentStatus())) {
            return ResponseEntity.ok(Map.of(
                    "message", "Payment already verified",
                    "paymentStatus", "SUCCESS",
                    "orderNumber", order.getOrderNumber()));
        }

        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Order is already marked as paid"));
        }

        // Keep paymentReference as the Razorpay ORDER ID.
        // Do not overwrite it with the Razorpay PAYMENT ID.
        payment.setPaymentStatus("SUCCESS");
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        order.setPaymentStatus("PAID");
        orderRepository.save(order);

        return ResponseEntity.ok(Map.of(
                "message", "Payment verified successfully",
                "paymentStatus", "SUCCESS",
                "orderNumber", order.getOrderNumber()));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
