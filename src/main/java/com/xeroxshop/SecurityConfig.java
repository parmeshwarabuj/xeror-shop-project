
package com.xeroxshop;

import java.util.List;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Value("${app.admin.username:}")
    private String adminUsername;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /*
     * Supports both:
     * 1. Admin credentials configured in application.properties/environment.
     * 2. Shop-owner accounts stored in the database.
     */
  

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Main admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Dashboard can be accessed by admins and shop owners
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/orders/dashboard"
                ).hasAnyRole("ADMIN", "SHOP_OWNER")

                // Order status updates
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/orders/*/status"
                ).hasAnyRole("ADMIN", "SHOP_OWNER")

                // File management restricted to admin
              // Viewing order files allowed for admins and shop owners
.requestMatchers(
    HttpMethod.GET,
    "/api/orders/*/files"
).hasAnyRole("ADMIN", "SHOP_OWNER")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/orders/*/files/*/download"
                ).hasAnyRole("ADMIN", "SHOP_OWNER")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/orders/*/files/*/enhance"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/orders/*/files/*/print"
                ).hasRole("ADMIN")

                // Customer listing restricted to admin
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/customers"
                ).hasRole("ADMIN")

                // Preserve your existing rules for other endpoints.
                .anyRequest().permitAll()
            )
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        ));

        config.setAllowedMethods(List.of(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of(
            "Authorization", "Content-Type", "Accept"
        ));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
