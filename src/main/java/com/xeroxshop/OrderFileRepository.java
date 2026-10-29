
package com.xeroxshop;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderFileRepository
        extends JpaRepository<OrderFile, Long> {

    List<OrderFile> findByOrder_OrderId(Long orderId);
}
