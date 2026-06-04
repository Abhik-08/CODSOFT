package com.abhik.currencyconverter.client;

import com.abhik.currencyconverter.dto.ExchangeRateApiResponse;
import com.abhik.currencyconverter.dto.RatesResponse;
import com.abhik.currencyconverter.exception.ExchangeRateApiException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Slf4j
@Component
public class ExchangeRateClient {

    private final RestClient restClient;

    public ExchangeRateClient(
            @Value("${exchange-rate-api.base-url}") @NonNull String baseUrl,
            RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl(baseUrl).build();
    }

    public RatesResponse getRates(String baseCurrency) {
        log.info("Fetching exchange rates for base currency: {}", baseCurrency);

        try {
            ExchangeRateApiResponse response = restClient.get()
                    .uri("/{baseCurrency}", baseCurrency)
                    .retrieve()
                    .body(ExchangeRateApiResponse.class);

            if (response == null || !"success".equalsIgnoreCase(response.getResult())) {
                log.error("API returned unsuccessful result or empty body: {}", response);
                throw new ExchangeRateApiException("Failed to retrieve exchange rates from external API");
            }

            LocalDateTime timestamp = LocalDateTime.now();
            if (response.getTimeLastUpdateUnix() != null) {
                timestamp = LocalDateTime.ofInstant(
                        Instant.ofEpochSecond(response.getTimeLastUpdateUnix()),
                        ZoneId.systemDefault()
                );
            }

            return RatesResponse.builder()
                    .baseCurrency(response.getBaseCode())
                    .rates(response.getRates())
                    .timestamp(timestamp)
                    .build();

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("HTTP error during exchange rate fetch: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new ExchangeRateApiException("External exchange rate API error: " + e.getStatusCode(), e);
        } catch (RestClientException e) {
            log.error("Rest client error during exchange rate fetch", e);
            throw new ExchangeRateApiException("External exchange rate API connection failed", e);
        } catch (Exception e) {
            log.error("Unexpected error during exchange rate fetch", e);
            throw new ExchangeRateApiException("Unexpected error fetching exchange rates", e);
        }
    }
}
