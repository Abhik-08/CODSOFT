package com.apex.atm.exception;

import org.springframework.http.HttpStatus;

public class InvalidAmountException extends AtmException {
    public InvalidAmountException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
