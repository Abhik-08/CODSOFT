package com.apex.atm.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends AtmException {
    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
