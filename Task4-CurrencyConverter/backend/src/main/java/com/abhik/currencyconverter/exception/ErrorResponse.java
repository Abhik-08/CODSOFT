package com.abhik.currencyconverter.exception;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class ErrorResponse {

    LocalDateTime timestamp;
    int status;
    String message;
}
