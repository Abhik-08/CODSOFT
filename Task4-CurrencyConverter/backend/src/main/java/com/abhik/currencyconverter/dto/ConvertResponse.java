package com.abhik.currencyconverter.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class ConvertResponse {

    String fromCurrency;
    String toCurrency;
    BigDecimal amount;
    BigDecimal exchangeRate;
    BigDecimal convertedAmount;
    LocalDateTime timestamp;
}
