package com.apex.atm.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);
    private static final String ERROR = "ERROR";

    private static final List<String> MODELS = List.of(
        "gemini-2.0-flash",                 // Unlimited rate limit (stable 2.0 flash) - primary choice
        "gemini-2.0-flash-lite",            // Unlimited rate limit (lightweight 2.0)
        "gemini-1.5-flash",                 // Legacy reliable fallback
        "gemini-1.5-flash-8b",              // Smaller fallback
        "gemini-1.5-pro",                   // Pro fallback
        "gemini-1.0-pro"                    // Last resort
    );

    private final Map<String, Long> rateLimitCooldowns = new java.util.concurrent.ConcurrentHashMap<>();

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generate(String prompt) {
        List<String> keys = getApiKeys();
        if (keys.isEmpty()) {
            logger.warn("No Gemini API keys are configured.");
            return ERROR;
        }

        for (String model : MODELS) {
            String result = tryModelWithKeys(model, prompt, keys);
            if (result != null) {
                return result;
            }
        }

        logger.error("All configured Gemini models and keys failed.");
        return ERROR;
    }

    private String tryModelWithKeys(String model, String prompt, List<String> keys) {
        List<String> shuffledKeys = new java.util.ArrayList<>(keys);
        java.util.Collections.shuffle(shuffledKeys);
        long now = System.currentTimeMillis();

        for (String currentKey : shuffledKeys) {
            String cooldownKey = currentKey + ":" + model;
            boolean isCooldown = rateLimitCooldowns.containsKey(cooldownKey) && now < rateLimitCooldowns.get(cooldownKey);

            if (!isCooldown) {
                try {
                    return executeApiWithFallback(model, prompt, currentKey, cooldownKey);
                } catch (UnsupportedModelException e) {
                    return null;
                }
            }
        }
        return null;
    }

    private String executeApiWithFallback(String model, String prompt, String currentKey, String cooldownKey) {
        try {
            return callGeminiApi(model, prompt, currentKey);
        } catch (HttpClientErrorException.TooManyRequests e) {
            logger.warn("Gemini model {} hit rate limit (429) with key. Placing combination on 60s cooldown.", model);
            rateLimitCooldowns.put(cooldownKey, System.currentTimeMillis() + 60000); // 1 minute cooldown
        } catch (HttpClientErrorException e) {
            int statusCode = e.getStatusCode().value();
            if (statusCode == 404 || statusCode == 400) {
                logger.warn("Gemini model {} not supported or not found (status {}). Skipping model.", model, statusCode);
                throw new UnsupportedModelException();
            }
            logger.error("HTTP error calling Gemini model {} (status {}): {}", model, statusCode, e.getResponseBodyAsString());
        } catch (Exception e) {
            logger.error("Error calling Gemini model {}: {}", model, e.getMessage());
        }
        return null;
    }

    private static class UnsupportedModelException extends RuntimeException {
        private static final long serialVersionUID = 1L;
    }

    private List<String> getApiKeys() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return List.of();
        }
        return Arrays.stream(apiKey.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private String callGeminiApi(String model, String prompt, String key) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;

        // Build request payload
        Map<String, Object> requestBody = new HashMap<>();
        
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));

        requestBody.put("contents", List.of(content));

        // Execute HTTP POST request using RestTemplate
        Map<?, ?> response = restTemplate.postForObject(url, requestBody, Map.class);
        if (response == null) {
            throw new IllegalStateException("Gemini API returned null response.");
        }

        // Parse result candidate hierarchy
        List<?> candidates = (List<?>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            throw new IllegalStateException("Gemini API response has no candidates.");
        }

        Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
        Map<?, ?> responseContent = (Map<?, ?>) candidate.get("content");
        if (responseContent == null) {
            throw new IllegalStateException("Gemini API candidate has no content.");
        }

        List<?> parts = (List<?>) responseContent.get("parts");
        if (parts == null || parts.isEmpty()) {
            throw new IllegalStateException("Gemini API content has no parts.");
        }

        Map<?, ?> partObj = (Map<?, ?>) parts.get(0);
        String text = (String) partObj.get("text");
        if (text == null) {
            throw new IllegalStateException("Gemini API part has no text.");
        }

        return text;
    }
}
