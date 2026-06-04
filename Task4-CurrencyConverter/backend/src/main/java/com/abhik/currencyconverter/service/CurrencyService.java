package com.abhik.currencyconverter.service;

import com.abhik.currencyconverter.client.ExchangeRateClient;
import com.abhik.currencyconverter.dto.ConvertResponse;
import com.abhik.currencyconverter.dto.RatesResponse;
import com.abhik.currencyconverter.exception.InvalidAmountException;
import com.abhik.currencyconverter.exception.InvalidCurrencyException;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CurrencyService {

    private final ExchangeRateClient exchangeRateClient;

    public RatesResponse getRates(String baseCurrency) {
        if (baseCurrency == null || baseCurrency.trim().isEmpty()) {
            log.error("Validation failed: baseCurrency is blank");
            throw new InvalidCurrencyException("Base currency code must not be empty");
        }

        String normalizedBase = baseCurrency.trim().toUpperCase();
        log.info("Requesting rates for base currency: {}", normalizedBase);

        return exchangeRateClient.getRates(normalizedBase);
    }

    public ConvertResponse convertCurrency(String fromCurrency, String toCurrency, BigDecimal amount) {
        if (amount == null) {
            log.error("Validation failed: amount is null");
            throw new InvalidAmountException("Amount must not be null");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            log.error("Validation failed: amount is non-positive ({})", amount);
            throw new InvalidAmountException("Amount must be greater than zero");
        }
        if (fromCurrency == null || fromCurrency.trim().isEmpty()) {
            log.error("Validation failed: fromCurrency is blank");
            throw new InvalidCurrencyException("Source currency must not be empty");
        }
        if (toCurrency == null || toCurrency.trim().isEmpty()) {
            log.error("Validation failed: toCurrency is blank");
            throw new InvalidCurrencyException("Target currency must not be empty");
        }

        String normalizedFrom = fromCurrency.trim().toUpperCase();
        String normalizedTo = toCurrency.trim().toUpperCase();

        log.info("Converting {} from {} to {}", amount, normalizedFrom, normalizedTo);

        RatesResponse ratesResponse = getRates(normalizedFrom);

        if (ratesResponse.getRates() == null || !ratesResponse.getRates().containsKey(normalizedTo)) {
            log.error("Unsupported or invalid target currency: {}", normalizedTo);
            throw new InvalidCurrencyException("Target currency '" + normalizedTo + "' is invalid or not supported");
        }

        BigDecimal exchangeRate = ratesResponse.getRates().get(normalizedTo);
        BigDecimal convertedAmount = amount.multiply(exchangeRate);

        return ConvertResponse.builder()
                .fromCurrency(normalizedFrom)
                .toCurrency(normalizedTo)
                .amount(amount)
                .exchangeRate(exchangeRate)
                .convertedAmount(convertedAmount)
                .timestamp(ratesResponse.getTimestamp())
                .build();
    }
}
