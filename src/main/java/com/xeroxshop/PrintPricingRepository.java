
package com.xeroxshop;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrintPricingRepository
        extends JpaRepository<PrintPricing, Long> {

    Optional<PrintPricing> findByShop_ShopIdAndColorModeAndPrintSidesAndIsActiveTrue(
            Long shopId,
            String colorMode,
            String printSides
    );
}
