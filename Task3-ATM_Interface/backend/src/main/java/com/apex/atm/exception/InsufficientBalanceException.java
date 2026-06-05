package com.apex.atm.exception;

import org.springframework.http.HttpStatus;

public class InsufficientBalanceException extends AtmException {
    public InsufficientBalanceException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
