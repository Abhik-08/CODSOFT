package com.abhik.currencyconverter.exception;

import org.springframework.http.HttpStatus;

public class InvalidCurrencyException extends ApiException {

    public InvalidCurrencyException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
