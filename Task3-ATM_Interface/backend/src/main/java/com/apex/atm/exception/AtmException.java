package com.apex.atm.exception;

import org.springframework.http.HttpStatus;

public class AtmException extends RuntimeException {

    private final HttpStatus status;

    public AtmException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }

    public AtmException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return this.status;
    }
}
