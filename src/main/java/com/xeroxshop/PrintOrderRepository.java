
package com.xeroxshop;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrintOrderRepository
        extends JpaRepository<PrintOrder, Long> {

    Optional<PrintOrder> findByOrderNumber(String orderNumber);

    List<PrintOrder> findAllByOrderByOrderIdDesc();

    // Registered customer's orders, newest first
    List<PrintOrder> findAllByCustomer_CustomerIdOrderByOrderIdDesc(
            Long customerId);

    // Guest customer's orders, newest first
    List<PrintOrder> findAllByGuestCustomer_CustomerIdOrderByOrderIdDesc(
            Long guestCustomerId);
            
    // Orders for one shop, newest first
    List<PrintOrder> findAllByShop_ShopIdOrderByOrderIdDesc(
            Long shopId);

}
