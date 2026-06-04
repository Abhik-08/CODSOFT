package com.abhik.currencyconverter.controller;

import com.abhik.currencyconverter.dto.ConvertRequest;
import com.abhik.currencyconverter.dto.ConvertResponse;
import com.abhik.currencyconverter.dto.RatesResponse;
import com.abhik.currencyconverter.service.CurrencyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Currency Converter", description = "REST APIs for querying exchange rates and performing currency conversions")
@RestController
@RequestMapping("/api/currency")
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyService currencyService;

    @Operation(summary = "Get exchange rates for a base currency", description = "Retrieves the latest exchange rates for the specified base currency code (e.g. USD, EUR, INR).")
    @GetMapping("/rates/{baseCurrency}")
    public ResponseEntity<RatesResponse> getRates(@PathVariable String baseCurrency) {
        RatesResponse rates = currencyService.getRates(baseCurrency);
        return ResponseEntity.ok(rates);
    }

    @Operation(summary = "Convert amount between currencies", description = "Converts a positive amount from a source currency to a target currency using the latest exchange rates.")
    @PostMapping("/convert")
    public ResponseEntity<ConvertResponse> convertCurrency(@Valid @RequestBody ConvertRequest request) {
        ConvertResponse response = currencyService.convertCurrency(
                request.getFromCurrency(),
                request.getToCurrency(),
                request.getAmount()
        );
        return ResponseEntity.ok(response);
    }
}
