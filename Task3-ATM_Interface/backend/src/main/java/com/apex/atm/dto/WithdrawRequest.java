package com.apex.atm.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class WithdrawRequest {

    @NotNull(message = "Withdrawal amount cannot be null")
    @DecimalMin(value = "5.00", message = "Minimum withdrawal amount is $5.00")
    @Digits(integer = 4, fraction = 2, message = "Invalid monetary format")
    private Double amount;

    @Size(max = 100, message = "Description cannot exceed 100 characters")
    private String description;
}
