package com.apex.atm.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request payload for execution of cash withdrawal")
public class WithdrawRequestDTO {

    @Schema(description = "Amount to withdraw from the checking account. Must be greater than zero.", example = "100.00", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Withdrawal amount cannot be null")
    @Positive(message = "Withdrawal amount must be greater than zero")
    @Digits(integer = 6, fraction = 2, message = "Invalid monetary format")
    private Double amount;

    @Schema(description = "Optional description context for the withdrawal record", example = "ATM cash withdrawal", maxLength = 100)
    @Size(max = 100, message = "Description cannot exceed 100 characters")
    private String description;
}
