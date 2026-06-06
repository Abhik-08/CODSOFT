package com.apex.atm.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);
    private static final String ERROR = "ERROR";

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generate(String prompt) {
        List<String> keys = getApiKeys();
        if (keys.isEmpty()) {
            logger.warn("No Gemini API keys are configured.");
            return ERROR;
        }

        for (int i = 0; i < keys.size(); i++) {
            String currentKey = keys.get(i);
            try {
                return callGeminiApi(prompt, currentKey);
            } catch (HttpClientErrorException.TooManyRequests e) {
                logger.warn("Gemini API Key index {} hit rate limit (429). Trying next key...", i);
            } catch (Exception e) {
                logger.error("Error calling Gemini API with key index {}: {}", i, e.getMessage());
            }
        }

        logger.error("All configured Gemini API keys failed or exhausted their quota.");
        return ERROR;
    }

    private List<String> getApiKeys() {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return List.of();
        }
        return Arrays.stream(apiKey.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private String callGeminiApi(String prompt, String key) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + key;

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
            throw new RuntimeException("Gemini API returned null response.");
        }

        // Parse result candidate hierarchy
        List<?> candidates = (List<?>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            throw new RuntimeException("Gemini API response has no candidates.");
        }

        Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
        Map<?, ?> responseContent = (Map<?, ?>) candidate.get("content");
        if (responseContent == null) {
            throw new RuntimeException("Gemini API candidate has no content.");
        }

        List<?> parts = (List<?>) responseContent.get("parts");
        if (parts == null || parts.isEmpty()) {
            throw new RuntimeException("Gemini API content has no parts.");
        }

        Map<?, ?> partObj = (Map<?, ?>) parts.get(0);
        String text = (String) partObj.get("text");
        if (text == null) {
            throw new RuntimeException("Gemini API part has no text.");
        }

        return text;
    }
}
