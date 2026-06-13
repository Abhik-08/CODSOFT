package com.eduvault.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Service
public class AiFallbackHandler {

    private final RestTemplate restTemplate;

    @Value("${ai.gemini.api-key}")
    private String geminiApiKey;

    @Value("${ai.groq.api-key}")
    private String groqApiKey;

    public AiFallbackHandler() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(8000);
        factory.setReadTimeout(12000);
        this.restTemplate = new RestTemplate(factory);
    }

    public String callProvider(String provider, String model, String systemInstruction, String prompt) {
        if ("gemini".equalsIgnoreCase(provider)) {
            return callGemini(model, systemInstruction, prompt);
        } else if ("groq".equalsIgnoreCase(provider)) {
            return callGroq(model, systemInstruction, prompt);
        }
        throw new IllegalArgumentException("Unknown provider: " + provider);
    }

    private String callGemini(String model, String systemInstruction, String prompt) {
        String apiKey = geminiApiKey;
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Gemini API key is not configured in backend environment");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", prompt))
                )
            ),
            "systemInstruction", Map.of(
                "parts", List.of(Map.of("text", systemInstruction))
            )
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            return response.getBody();
        } else {
            throw new org.springframework.web.client.RestClientException("Gemini API returned status code " + response.getStatusCode());
        }
    }

    private String callGroq(String model, String systemInstruction, String prompt) {
        String apiKey = groqApiKey;
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Groq API key is not configured in backend environment");
        }

        String url = "https://api.groq.com/openai/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", systemInstruction),
                Map.of("role", "user", "content", prompt)
            )
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            return response.getBody();
        } else {
            throw new org.springframework.web.client.RestClientException("Groq API returned status code " + response.getStatusCode());
        }
    }
}
