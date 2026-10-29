
package com.xeroxshop;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("password-check")
public class PasswordCheckRunner implements CommandLineRunner {

    private final ShopOwnerRepository repository;
    private final PasswordEncoder passwordEncoder;

    public PasswordCheckRunner(
            ShopOwnerRepository repository,
            PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String username = "ravi_test_001";

        // Set this locally to the password you want to verify.
        String enteredPassword = "XeroxTest@123";

        ShopOwner owner = repository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalStateException("Owner not found"));

        boolean matches = passwordEncoder.matches(
                enteredPassword,
                owner.getPasswordHash());

        System.out.println("Password matches: " + matches);
    }
}
