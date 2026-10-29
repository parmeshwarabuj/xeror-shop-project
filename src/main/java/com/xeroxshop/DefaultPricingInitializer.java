
package com.xeroxshop;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DefaultPricingInitializer implements ApplicationRunner {

    private final ShopRepository shopRepository;
    private final PrintPricingRepository pricingRepository;

    public DefaultPricingInitializer(
            ShopRepository shopRepository,
            PrintPricingRepository pricingRepository) {
        this.shopRepository = shopRepository;
        this.pricingRepository = pricingRepository;
    }

    private record DefaultPrice(
            String colorMode,
            String printSides,
            BigDecimal price,
            String billingUnit) {
    }

    private static final List<DefaultPrice> DEFAULT_PRICES = List.of(
        new DefaultPrice("BLACK_WHITE", "SINGLE",
                new BigDecimal("2.00"), "SIDE"),
        new DefaultPrice("BLACK_WHITE", "DOUBLE",
                new BigDecimal("3.00"), "SHEET"),
        new DefaultPrice("COLOR", "SINGLE",
                new BigDecimal("10.00"), "SIDE"),
        new DefaultPrice("COLOR", "DOUBLE",
                new BigDecimal("15.00"), "SHEET")
    );

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        shopRepository.findAll().stream()
            .filter(shop -> Boolean.TRUE.equals(shop.getIsActive()))
            .forEach(shop -> {
                for (DefaultPrice defaults : DEFAULT_PRICES) {
                    boolean exists = pricingRepository
                        .findByShop_ShopIdAndColorModeAndPrintSidesAndIsActiveTrue(
                            shop.getShopId(),
                            defaults.colorMode(),
                            defaults.printSides()
                        )
                        .isPresent();

                    if (!exists) {
                        PrintPricing pricing = new PrintPricing();
                        pricing.setShop(shop);
                        pricing.setColorMode(defaults.colorMode());
                        pricing.setPrintSides(defaults.printSides());
                        pricing.setPricePerUnit(defaults.price());
                        pricing.setBillingUnit(defaults.billingUnit());
                        pricing.setIsActive(true);

                        pricingRepository.save(pricing);
                    }
                }
            });
    }
}
