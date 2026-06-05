package com.apex.atm.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request body payload for changing daily ATM limits")
public class DailyLimitRequestDTO {

    @Min(value = 1, message = "Daily withdrawal limit must be at least 1.00")
    @Schema(description = "New daily withdrawal limit value", example = "50000.00")
    private double limit;
}
