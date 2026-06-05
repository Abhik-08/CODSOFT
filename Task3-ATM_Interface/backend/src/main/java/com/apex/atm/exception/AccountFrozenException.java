package com.apex.atm.exception;

import org.springframework.http.HttpStatus;

public class AccountFrozenException extends AtmException {
    public AccountFrozenException(String message) {
        super(message, HttpStatus.FORBIDDEN);
    }
}
