
package com.xeroxshop;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByOrder_OrderId(Long orderId);
    Optional<Payment> findByPaymentReference(String paymentReference);
    @Query("""
    SELECT p
    FROM Payment p
    JOIN FETCH p.order
    WHERE p.paymentReference = :reference
    """)
Optional<Payment> findByPaymentReferenceWithOrder(
        @Param("reference") String reference);

}
