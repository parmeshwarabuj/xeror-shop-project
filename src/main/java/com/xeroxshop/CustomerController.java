
package com.xeroxshop;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.xeroxshop.CustomerController.CustomerLoginRequest;
import com.xeroxshop.CustomerController.CustomerLoginResponse;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerController(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Existing customer listing endpoint.
    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // Register a customer and store a BCrypt password hash.
    @PostMapping
    public Customer createCustomer(
            @RequestBody RegistrationRequest request) {

        if (request.fullName() == null
                || request.fullName().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Customer name is required"
            );
        }

        if (request.phone() == null
                || request.phone().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Mobile number is required"
            );
        }

        if (request.password() == null
                || request.password().length() < 8) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Password must contain at least 8 characters"
            );
        }

        String phone = request.phone().trim();
        String email = request.email() == null
                || request.email().isBlank()
                ? null
                : request.email().trim().toLowerCase(Locale.ROOT);

        if (customerRepository.existsByPhone(phone)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "This mobile number is already registered"
            );
        }

        if (email != null
                && customerRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "This email address is already registered"
            );
        }

        Customer customer = new Customer();
        customer.setFullName(request.fullName().trim());
        customer.setPhone(phone);
        customer.setEmail(email);
        customer.setPasswordHash(
            passwordEncoder.encode(request.password())
        );
        customer.setCreatedAt(LocalDateTime.now());

        return customerRepository.save(customer);
    }

    public record RegistrationRequest(
            String fullName,
            String phone,
            String email,
            String password) {
    }
    

@PostMapping("/login")
public CustomerLoginResponse login(
        @RequestBody CustomerLoginRequest request,
        HttpServletRequest httpRequest) {

    if (request.identifier() == null
            || request.identifier().isBlank()
            || request.password() == null
            || request.password().isBlank()) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Mobile/email and password are required"
        );
    }

    String identifier = request.identifier().trim();

    Customer customer;

    if (identifier.contains("@")) {
        customer = customerRepository
            .findByEmailIgnoreCase(identifier)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid mobile/email or password"
            ));
    } else {
        customer = customerRepository
            .findByPhone(identifier)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid mobile/email or password"
            ));
    }

    if (customer.getPasswordHash() == null
            || !passwordEncoder.matches(
                request.password(),
                customer.getPasswordHash())) {
        throw new ResponseStatusException(
            HttpStatus.UNAUTHORIZED,
            "Invalid mobile/email or password"
        );
    }

    // Create a fresh server-side session after successful login.
    HttpSession oldSession = httpRequest.getSession(false);

    if (oldSession != null) {
        oldSession.invalidate();
    }

    HttpSession session = httpRequest.getSession(true);
    session.setAttribute(
        "CUSTOMER_ID",
        customer.getCustomerId()
    );

    // Preserve the existing frontend response.
    return new CustomerLoginResponse(
        customer.getCustomerId(),
        customer.getFullName(),
        customer.getPhone(),
        customer.getEmail()
    );
}


public record CustomerLoginRequest(
        String identifier,
        String password) {
}

public record CustomerLoginResponse(
        Long customerId,
        String fullName,
        String phone,
        String email) {
}

}
