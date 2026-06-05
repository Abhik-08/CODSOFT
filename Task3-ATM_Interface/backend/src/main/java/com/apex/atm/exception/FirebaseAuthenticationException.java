package com.apex.atm.exception;

import org.springframework.http.HttpStatus;

public class FirebaseAuthenticationException extends AtmException {
    public FirebaseAuthenticationException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}
