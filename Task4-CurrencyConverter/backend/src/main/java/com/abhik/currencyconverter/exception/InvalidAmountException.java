package com.abhik.currencyconverter.exception;

import org.springframework.http.HttpStatus;

public class InvalidAmountException extends ApiException {

    public InvalidAmountException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
