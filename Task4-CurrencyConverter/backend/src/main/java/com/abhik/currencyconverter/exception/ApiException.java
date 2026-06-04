package com.abhik.currencyconverter.exception;

import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;

public class ApiException extends RuntimeException {

    @NonNull
    private final HttpStatus status;

    public ApiException(String message, @NonNull HttpStatus status) {
        super(message);
        this.status = status;
    }

    public ApiException(String message, Throwable cause, @NonNull HttpStatus status) {
        super(message, cause);
        this.status = status;
    }

    @NonNull
    public HttpStatus getStatus() {
        return status;
    }
}
