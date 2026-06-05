package com.abhik.currencyconverter.client;

import com.abhik.currencyconverter.dto.FrankfurterHistoricalResponse;
import com.abhik.currencyconverter.dto.HistoricalRateDto;
import com.abhik.currencyconverter.exception.ExchangeRateApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Slf4j
@Component
public class HistoricalRateClient {

    private final RestClient restClient;

    public HistoricalRateClient(
            @Value("${frankfurter-api.base-url}") @NonNull String baseUrl,
            RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl(baseUrl).build();
    }

    public List<HistoricalRateDto> getHistoricalRates(String from, String to, int days) {
        log.info("Fetching historical rates from Frankfurter for {} to {} over last {} days", from, to, days);

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);

        try {
            FrankfurterHistoricalResponse response = restClient.get()
                    .uri("/{startDate}..{endDate}?from={from}&to={to}",
                            startDate.toString(),
                            endDate.toString(),
                            from.toUpperCase(),
                            to.toUpperCase())
                    .retrieve()
                    .body(FrankfurterHistoricalResponse.class);

            if (response == null || response.getRates() == null) {
                log.warn("Frankfurter returned empty response for historical rates");
                return Collections.emptyList();
            }

            List<HistoricalRateDto> result = new ArrayList<>();
            // Use a TreeMap to guarantee sorting by date
            Map<String, Map<String, BigDecimal>> sortedRates = new TreeMap<>(response.getRates());

            for (Map.Entry<String, Map<String, BigDecimal>> entry : sortedRates.entrySet()) {
                String date = entry.getKey();
                Map<String, BigDecimal> currencyMap = entry.getValue();
                if (currencyMap != null && currencyMap.containsKey(to.toUpperCase())) {
                    result.add(HistoricalRateDto.builder()
                            .date(date)
                            .rate(currencyMap.get(to.toUpperCase()))
                            .build());
                }
            }

            return result;

        } catch (Exception e) {
            log.error("Error fetching historical rates from Frankfurter API", e);
            throw new ExchangeRateApiException("Error fetching historical rates: " + e.getMessage(), e);
        }
    }
}
