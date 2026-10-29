
package com.xeroxshop;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository
        extends JpaRepository<Customer, Long> {

    // Find a customer by mobile number.
    Optional<Customer> findByPhone(String phone);

    // Find a customer by email address.
    Optional<Customer> findByEmailIgnoreCase(String email);

    // Check whether a mobile number is already registered.
    boolean existsByPhone(String phone);

    // Check whether an email address is already registered.
    boolean existsByEmailIgnoreCase(String email);
}
