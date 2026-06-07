package com.abhik.gradecalculator.exception;

import lombok.Getter;
import java.util.Map;

@Getter
public class ValidationException extends RuntimeException {
    private final Map<String, String> errors;

    public ValidationException(Map<String, String> errors) {
        super("Input validation failed");
        this.errors = errors;
    }
}
