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
@Schema(description = "Standard envelope wrapping successful API operation response data")
public class ApiResponseDTO<T> {

    @Schema(description = "Indicates whether the request was completed successfully", example = "true")
    private boolean success;

    @Schema(description = "Success message describing the completed operation", example = "Cash deposited successfully")
    private String message;

    @Schema(description = "Response data envelope payload")
    private T data;

    @Schema(description = "Timestamp when the response was generated")
    private LocalDateTime timestamp;

    public static <T> ApiResponseDTO<T> success(T data, String message) {
        return ApiResponseDTO.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponseDTO<T> success(T data) {
        return success(data, "Operation completed successfully");
    }

    public static <T> ApiResponseDTO<T> error(String message) {
        return ApiResponseDTO.<T>builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
