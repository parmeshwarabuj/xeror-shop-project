
package com.xeroxshop;

import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ShopOwnerUserDetailsService implements UserDetailsService {

    private final ShopOwnerRepository shopOwnerRepository;
    private final String adminUsername;
    private final String adminPasswordHash;

    public ShopOwnerUserDetailsService(
            ShopOwnerRepository shopOwnerRepository,
            PasswordEncoder passwordEncoder) {

        this.shopOwnerRepository = shopOwnerRepository;

        String configuredUsername = System.getenv("SHOP_ADMIN_USERNAME");
        String configuredPassword = System.getenv("SHOP_ADMIN_PASSWORD");

        if (configuredUsername == null || configuredUsername.isBlank()
                || configuredPassword == null || configuredPassword.isBlank()) {
            this.adminUsername = "";
            this.adminPasswordHash = "";
        } else {
            this.adminUsername = configuredUsername;
            this.adminPasswordHash =
                    passwordEncoder.encode(configuredPassword);
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) {

        if (!adminUsername.isBlank() && adminUsername.equals(username)) {
            return User.withUsername(adminUsername)
                    .password(adminPasswordHash)
                    .roles("ADMIN")
                    .build();
        }

        ShopOwner owner = shopOwnerRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Invalid username or password"));

        if (!owner.isEnabled()) {
            throw new DisabledException(
                    "This shop owner account is not activated.");
        }

        return User.withUsername(owner.getUsername())
                .password(owner.getPasswordHash())
                .roles("SHOP_OWNER")
                .build();
    }
}
