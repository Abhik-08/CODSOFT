package com.apex.atm.exception;

import org.springframework.http.HttpStatus;

public class AccountNotFoundException extends AtmException {
    public AccountNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
