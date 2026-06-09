package com.eduvault.api.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private static final String SECRET_KEY = "your-256-bit-extremely-secure-and-long-secret-key-eduvault-saas-token";
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateToken(String username, String role) {
        try {
            Map<String, String> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");
            String headerJson = objectMapper.writeValueAsString(header);
            String headerBase64 = encodeBase64Url(headerJson.getBytes(StandardCharsets.UTF_8));

            long now = System.currentTimeMillis();
            Map<String, Object> payload = new HashMap<>();
            payload.put("sub", username);
            payload.put("role", role);
            payload.put("iat", now / 1000);
            payload.put("exp", (now + 86400000) / 1000); // 24 hours
            String payloadJson = objectMapper.writeValueAsString(payload);
            String payloadBase64 = encodeBase64Url(payloadJson.getBytes(StandardCharsets.UTF_8));

            String data = headerBase64 + "." + payloadBase64;
            String signature = sign(data, SECRET_KEY);

            return data + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate JWT token", e);
        }
    }

    public boolean validateToken(String token, String username) {
        if (token == null) return false;
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }
        try {
            String headerBase64 = parts[0];
            String payloadBase64 = parts[1];
            String signature = parts[2];

            String expectedSignature = sign(headerBase64 + "." + payloadBase64, SECRET_KEY);
            if (!expectedSignature.equals(signature)) {
                return false;
            }

            String payloadJson = new String(decodeBase64Url(payloadBase64), StandardCharsets.UTF_8);
            Map<String, Object> payload = objectMapper.readValue(payloadJson, new TypeReference<Map<String, Object>>() {});
            
            String subject = (String) payload.get("sub");
            Number exp = (Number) payload.get("exp");

            if (subject == null || !subject.equals(username)) {
                return false;
            }

            long expTime = exp.longValue() * 1000;
            if (expTime < System.currentTimeMillis()) {
                return false;
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        try {
            if (token == null) return null;
            String[] parts = token.split("\\.");
            if (parts.length != 3) return null;
            String payloadJson = new String(decodeBase64Url(parts[1]), StandardCharsets.UTF_8);
            Map<String, Object> payload = objectMapper.readValue(payloadJson, new TypeReference<Map<String, Object>>() {});
            return (String) payload.get("sub");
        } catch (Exception e) {
            return null;
        }
    }

    public String extractRole(String token) {
        try {
            if (token == null) return null;
            String[] parts = token.split("\\.");
            if (parts.length != 3) return null;
            String payloadJson = new String(decodeBase64Url(parts[1]), StandardCharsets.UTF_8);
            Map<String, Object> payload = objectMapper.readValue(payloadJson, new TypeReference<Map<String, Object>>() {});
            return (String) payload.get("role");
        } catch (Exception e) {
            return null;
        }
    }

    private String encodeBase64Url(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }

    private byte[] decodeBase64Url(String base64) {
        return Base64.getUrlDecoder().decode(base64);
    }

    private String sign(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return encodeBase64Url(bytes);
    }
}
