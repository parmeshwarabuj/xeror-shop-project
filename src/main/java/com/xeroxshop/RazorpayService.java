
package com.xeroxshop;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;

@Service
public class RazorpayService {

    private final String keyId;
    private final String keySecret;

    public RazorpayService(
            @Value("${razorpay.key.id}") String keyId,
            @Value("${razorpay.key.secret}") String keySecret) {

        this.keyId = keyId;
        this.keySecret = keySecret;
    }

    public String getKeyId() {
        return keyId;
    }

    public Order createOrder(long amountInPaise, String receipt)
            throws RazorpayException {

        if (keyId == null || keyId.isBlank()
                || keySecret == null || keySecret.isBlank()) {
            throw new IllegalStateException(
                    "Razorpay credentials are not configured");
        }

        if (amountInPaise <= 0) {
            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero");
        }

        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        JSONObject options = new JSONObject();
        options.put("amount", amountInPaise);
        options.put("currency", "INR");
        options.put("receipt", receipt);

        return client.orders.create(options);
    }

    public boolean verifyPaymentSignature(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature) {

        if (keySecret == null || keySecret.isBlank()
                || razorpayOrderId == null || razorpayOrderId.isBlank()
                || razorpayPaymentId == null || razorpayPaymentId.isBlank()
                || razorpaySignature == null || razorpaySignature.isBlank()) {
            return false;
        }

        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;

            Mac mac = Mac.getInstance("HmacSHA256");

            SecretKeySpec secretKey = new SecretKeySpec(
                    keySecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256");

            mac.init(secretKey);

            byte[] hash = mac.doFinal(
                    payload.getBytes(StandardCharsets.UTF_8));

            StringBuilder expectedSignature = new StringBuilder();

            for (byte b : hash) {
                expectedSignature.append(String.format("%02x", b & 0xff));
            }

            return MessageDigest.isEqual(
                    expectedSignature.toString().getBytes(StandardCharsets.UTF_8),
                    razorpaySignature.getBytes(StandardCharsets.UTF_8));

        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException(
                    "Unable to verify Razorpay payment signature", ex);
        }
    }

    public boolean isPaymentCapturedForOrder(
            String razorpayPaymentId,
            String expectedOrderId,
            long expectedAmountInPaise) throws RazorpayException {

        if (keyId == null || keyId.isBlank()
                || keySecret == null || keySecret.isBlank()) {
            throw new IllegalStateException(
                    "Razorpay credentials are not configured");
        }

        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        com.razorpay.Payment razorpayPayment =
                client.payments.fetch(razorpayPaymentId);

        String actualOrderId =
                razorpayPayment.has("order_id")
                        ? razorpayPayment.get("order_id").toString()
                        : "";

        String actualStatus =
                razorpayPayment.has("status")
                        ? razorpayPayment.get("status").toString()
                        : "";

        String actualCurrency =
                razorpayPayment.has("currency")
                        ? razorpayPayment.get("currency").toString()
                        : "";

        long actualAmount;

        try {
            actualAmount = Long.parseLong(
                    razorpayPayment.get("amount").toString());
        } catch (Exception ex) {
            return false;
        }

        return expectedOrderId.equals(actualOrderId)
                && "captured".equalsIgnoreCase(actualStatus)
                && "INR".equalsIgnoreCase(actualCurrency)
                && actualAmount == expectedAmountInPaise;
    }
}
