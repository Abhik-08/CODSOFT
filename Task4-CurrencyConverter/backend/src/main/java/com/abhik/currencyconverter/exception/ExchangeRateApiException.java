package com.abhik.currencyconverter.exception;

import org.springframework.http.HttpStatus;

public class ExchangeRateApiException extends ApiException {

    public ExchangeRateApiException(String message) {
        super(message, HttpStatus.BAD_GATEWAY);
    }

    public ExchangeRateApiException(String message, Throwable cause) {
        super(message, cause, HttpStatus.BAD_GATEWAY);
    }
}
