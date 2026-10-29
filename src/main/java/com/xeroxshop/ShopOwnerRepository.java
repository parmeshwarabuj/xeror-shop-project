
package com.xeroxshop;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShopOwnerRepository
        extends JpaRepository<ShopOwner, Long> {

    Optional<ShopOwner> findByUsername(String username);

    boolean existsByUsername(String username);

    Optional<ShopOwner> findByShop_ShopId(Long shopId);
}
