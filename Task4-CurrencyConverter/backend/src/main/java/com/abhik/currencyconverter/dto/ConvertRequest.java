package com.abhik.currencyconverter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class ConvertRequest {

    @NotBlank(message = "Source currency must not be blank")
    String fromCurrency;

    @NotBlank(message = "Target currency must not be blank")
    String toCurrency;

    @NotNull(message = "Amount must not be null")
    @Positive(message = "Amount must be greater than zero")
    BigDecimal amount;
}
