package com.apex.atm.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Standardized response payload representing an API operation error")
public class ApiErrorResponse {

    @Schema(description = "Indicates whether the request was processed successfully (always false for errors)", example = "false")
    private boolean success;

    @Schema(description = "HTTP Status Code representing the error context", example = "422")
    private int status;

    @Schema(description = "Standard HTTP Error Reason Phrase", example = "Unprocessable Entity")
    private String error;

    @Schema(description = "Descriptive error message context", example = "Withdrawal failed: Insufficient funds.")
    private String message;

    @Schema(description = "Originating endpoint request path", example = "/api/account/withdraw")
    private String path;

    @Schema(description = "Timestamp of error resolution")
    private LocalDateTime timestamp;

    @Schema(description = "List of supplementary validation errors or detailed messages", example = "[\"Withdrawal amount must be greater than zero\"]")
    private List<String> details;
}
