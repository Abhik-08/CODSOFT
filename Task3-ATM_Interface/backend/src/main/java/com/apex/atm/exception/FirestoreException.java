package com.apex.atm.exception;

import org.springframework.http.HttpStatus;

public class FirestoreException extends AtmException {
    public FirestoreException(String message) {
        super(message, HttpStatus.SERVICE_UNAVAILABLE);
    }
}
