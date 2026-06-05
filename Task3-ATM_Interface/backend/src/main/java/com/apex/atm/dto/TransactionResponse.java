package com.apex.atm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private String id;
    private String type; // CREDIT or DEBIT
    private double amount;
    private String description;
    private LocalDateTime createdAt;
    private double postTransactionBalance;
}
