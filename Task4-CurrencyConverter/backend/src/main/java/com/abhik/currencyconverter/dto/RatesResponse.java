package com.abhik.currencyconverter.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class RatesResponse {

    String baseCurrency;
    Map<String, BigDecimal> rates;
    LocalDateTime timestamp;
}
