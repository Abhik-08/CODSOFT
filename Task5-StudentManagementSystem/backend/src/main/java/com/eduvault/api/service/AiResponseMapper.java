package com.eduvault.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

@Service
public class AiResponseMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String extractReply(String provider, String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            if ("gemini".equalsIgnoreCase(provider)) {
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && parts.size() > 0) {
                        return parts.get(0).path("text").asText();
                    }
                }
            } else if ("groq".equalsIgnoreCase(provider)) {
                JsonNode choices = root.path("choices");
                if (choices.isArray() && choices.size() > 0) {
                    return choices.get(0).path("message").path("content").asText();
                }
            }
        } catch (Exception e) {
            // Log parse failure
        }
        return null;
    }

    public int extractTokensUsed(String provider, String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            if ("gemini".equalsIgnoreCase(provider)) {
                // Gemini returns token counts in usageMetadata
                JsonNode usage = root.path("usageMetadata");
                if (!usage.isMissingNode()) {
                    return usage.path("totalTokenCount").asInt(0);
                }
            } else if ("groq".equalsIgnoreCase(provider)) {
                JsonNode usage = root.path("usage");
                if (!usage.isMissingNode()) {
                    return usage.path("total_tokens").asInt(0);
                }
            }
        } catch (Exception e) {
            // Ignore
        }
        // Approximate token count based on response length as fallback
        return rawResponse != null ? rawResponse.length() / 4 : 0;
    }
}
