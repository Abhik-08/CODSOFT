package com.abhik.currencyconverter.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.abhik.currencyconverter.dto.ConvertResponse;
import com.abhik.currencyconverter.dto.RatesResponse;
import com.abhik.currencyconverter.exception.GlobalExceptionHandler;
import com.abhik.currencyconverter.exception.InvalidCurrencyException;
import com.abhik.currencyconverter.service.CurrencyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SuppressWarnings("null")
@WebMvcTest(CurrencyController.class)
@Import({com.abhik.currencyconverter.config.CorsConfig.class, GlobalExceptionHandler.class})
class CurrencyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CurrencyService currencyService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetRatesSuccess() throws Exception {
        Map<String, BigDecimal> rates = new HashMap<>();
        rates.put("EUR", new BigDecimal("0.92"));
        rates.put("INR", new BigDecimal("83.50"));

        RatesResponse response = RatesResponse.builder()
                .baseCurrency("USD")
                .rates(rates)
                .timestamp(LocalDateTime.now())
                .build();

        when(currencyService.getRates("USD")).thenReturn(response);

        mockMvc.perform(get("/api/currency/rates/USD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.baseCurrency").value("USD"))
                .andExpect(jsonPath("$.rates.EUR").value(0.92))
                .andExpect(jsonPath("$.rates.INR").value(83.50));
    }

    @Test
    void testConvertCurrencySuccess() throws Exception {
        ConvertResponse response = ConvertResponse.builder()
                .fromCurrency("USD")
                .toCurrency("EUR")
                .amount(new BigDecimal("100"))
                .exchangeRate(new BigDecimal("0.92"))
                .convertedAmount(new BigDecimal("92"))
                .timestamp(LocalDateTime.now())
                .build();

        when(currencyService.convertCurrency(anyString(), anyString(), any(BigDecimal.class)))
                .thenReturn(response);

        Map<String, Object> request = new HashMap<>();
        request.put("fromCurrency", "USD");
        request.put("toCurrency", "EUR");
        request.put("amount", 100);

        mockMvc.perform(post("/api/currency/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fromCurrency").value("USD"))
                .andExpect(jsonPath("$.toCurrency").value("EUR"))
                .andExpect(jsonPath("$.amount").value(100))
                .andExpect(jsonPath("$.convertedAmount").value(92));
    }

    @Test
    void testConvertCurrencyValidationError() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("fromCurrency", "");
        request.put("toCurrency", "EUR");
        request.put("amount", -50); // Negative amount is invalid

        mockMvc.perform(post("/api/currency/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Validation failed")));
    }

    @Test
    void testExceptionHandling() throws Exception {
        when(currencyService.getRates("XYZ"))
                .thenThrow(new InvalidCurrencyException("Base currency code must not be empty"));

        mockMvc.perform(get("/api/currency/rates/XYZ"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Base currency code must not be empty"))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void testCorsConfiguration() throws Exception {
        mockMvc.perform(options("/api/currency/rates/USD")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "*"));
    }
}
