package com.abhik.currencyconverter.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.Map;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class ExchangeRateApiResponse {

    String result;

    @JsonProperty("base_code")
    String baseCode;

    Map<String, BigDecimal> rates;

    @JsonProperty("time_last_update_unix")
    Long timeLastUpdateUnix;
}
