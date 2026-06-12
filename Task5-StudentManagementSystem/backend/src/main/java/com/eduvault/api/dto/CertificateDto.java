package com.eduvault.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CertificateDto {
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Issuer is required")
    private String issuer;

    @NotBlank(message = "Issue date is required")
    private String issueDate;

    private String certificateUrl;
    private String createdAt;
}
