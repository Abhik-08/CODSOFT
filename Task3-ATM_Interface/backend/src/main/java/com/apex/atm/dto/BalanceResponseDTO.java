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
@Schema(description = "Response payload for account balance retrieval")
public class BalanceResponseDTO {

    @Schema(description = "Firebase UID of the account owner", example = "user_abc123")
    private String userId;

    @Schema(description = "Current available balance of the checking account", example = "1050.75")
    private double balance;

    @Schema(description = "Timestamp of the last update to the balance")
    private LocalDateTime lastUpdatedAt;
}
