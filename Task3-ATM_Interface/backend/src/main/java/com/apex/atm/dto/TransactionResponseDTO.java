package com.apex.atm.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response payload representing a transaction record")
public class TransactionResponseDTO {

    @Schema(description = "Unique identifier of the transaction", example = "txn_987654321")
    private String id;

    @Schema(description = "Type of transaction (credit or debit)", example = "credit")
    private String type; // credit or debit

    @Schema(description = "Amount processed in the transaction", example = "150.00")
    private double amount;

    @Schema(description = "Description context for the transaction", example = "ATM Cash Deposit")
    private String description;

    @Schema(description = "Timestamp when the transaction was executed")
    private LocalDateTime createdAt;

    @Schema(description = "Account balance immediately after this transaction was processed", example = "1200.75")
    private double postTransactionBalance;
}
