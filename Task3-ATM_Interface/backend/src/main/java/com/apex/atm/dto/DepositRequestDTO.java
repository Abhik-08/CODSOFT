package com.apex.atm.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request payload for execution of cash deposit")
public class DepositRequestDTO {

    @Schema(description = "Amount to deposit into the checking account. Must be greater than zero.", example = "250.00", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Deposit amount cannot be null")
    @Positive(message = "Deposit amount must be greater than zero")
    @Digits(integer = 6, fraction = 2, message = "Invalid monetary format")
    private Double amount;

    @Schema(description = "Optional description context for the deposit record", example = "Over the counter deposit", maxLength = 100)
    @Size(max = 100, message = "Description cannot exceed 100 characters")
    private String description;
}
