package com.apex.atm.dto;

import lombok.Data;

@Data
public class TransactionRequestDto {
    private String type;
    private double amount;
    private String description;
}
