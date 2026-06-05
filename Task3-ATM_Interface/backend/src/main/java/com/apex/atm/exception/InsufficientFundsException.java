package com.apex.atm.exception;

import org.springframework.http.HttpStatus;

public class InsufficientFundsException extends AtmException {
    public InsufficientFundsException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
