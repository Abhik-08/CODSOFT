package com.apex.atm.exception;

import org.springframework.http.HttpStatus;

public class DailyLimitExceededException extends AtmException {
    public DailyLimitExceededException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
