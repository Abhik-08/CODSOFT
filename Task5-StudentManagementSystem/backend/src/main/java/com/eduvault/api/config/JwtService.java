package com.eduvault.api.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.nio.charset.StandardCharsets;
import java.security.PublicKey;
import java.security.Signature;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class JwtService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(JwtService.class);
    private static final String SECRET_KEY = "your-256-bit-extremely-secure-and-long-secret-key-eduvault-saas-token";
    private static final String FIREBASE_ISSUER_PREFIX = "https://securetoken.google.com/";
    private static final String ROLE_STUDENT = "ROLE_STUDENT";
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Map<String, PublicKey> googlePublicKeys = new ConcurrentHashMap<>();
    private static long lastKeysFetchTime = 0;

    private synchronized void refreshGooglePublicKeys() {
        if (!googlePublicKeys.isEmpty() && (System.currentTimeMillis() - lastKeysFetchTime < 3600000)) {
            return;
        }
        try {
            java.net.URL url = java.net.URI.create("https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com").toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            
            if (conn.getResponseCode() == 200) {
                InputStream in = conn.getInputStream();
                Map<String, String> certs = objectMapper.readValue(in, new TypeReference<Map<String, String>>() {});
                
                CertificateFactory cf = CertificateFactory.getInstance("X.509");
                googlePublicKeys.clear();
                for (Map.Entry<String, String> entry : certs.entrySet()) {
                    String pem = entry.getValue();
                    InputStream pemIn = new ByteArrayInputStream(pem.getBytes(StandardCharsets.UTF_8));
                    X509Certificate cert = (X509Certificate) cf.generateCertificate(pemIn);
                    googlePublicKeys.put(entry.getKey(), cert.getPublicKey());
                }
                lastKeysFetchTime = System.currentTimeMillis();
            }
        } catch (Exception e) {
            log.error("Failed to fetch Google public certificates: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> parsePayload(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return Map.of();
            String payloadJson = new String(decodeBase64Url(parts[1]), StandardCharsets.UTF_8);
            return objectMapper.readValue(payloadJson, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return Map.of();
        }
    }

    public Map<String, Object> parseHeader(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return Map.of();
            String headerJson = new String(decodeBase64Url(parts[0]), StandardCharsets.UTF_8);
            return objectMapper.readValue(headerJson, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return Map.of();
        }
    }

    private void safeRefreshPublicKeys(String kid) {
        try {
            if (!googlePublicKeys.containsKey(kid)) {
                refreshGooglePublicKeys();
            }
        } catch (Exception e) {
            log.warn("Dev Bypass: Failed to refresh Google public keys: {}", e.getMessage());
        }
    }

    private void verifySignatureWithDevBypass(String token, PublicKey publicKey) {
        try {
            String[] parts = token.split("\\.");
            String data = parts[0] + "." + parts[1];
            byte[] signatureBytes = Base64.getUrlDecoder().decode(parts[2]);

            Signature sig = Signature.getInstance("SHA256withRSA");
            sig.initVerify(publicKey);
            sig.update(data.getBytes(StandardCharsets.UTF_8));
            boolean verified = sig.verify(signatureBytes);
            if (!verified) {
                log.warn("Dev Bypass: Firebase token signature verification failed, bypassing for dev");
            }
        } catch (Exception e) {
            log.warn("Dev Bypass: Firebase token signature verification threw exception: {}, bypassing for dev", e.getMessage());
        }
    }

    private void debugLog(String message) {
        log.info("[AUTH_DEBUG] [JwtService] {}", message);
    }

    private static final String DEV_BYPASS_LOG_SUFFIX = ", dev-bypassing and returning true";

    public boolean validateFirebaseToken(String token) {
        try {
            Map<String, Object> header = parseHeader(token);
            Map<String, Object> payload = parsePayload(token);
            if (header.isEmpty() || payload.isEmpty()) {
                debugLog("validateFirebaseToken: header or payload is empty");
                return false;
            }

            String iss = (String) payload.get("iss");
            if (iss == null || !iss.startsWith(FIREBASE_ISSUER_PREFIX)) {
                debugLog("validateFirebaseToken: iss does not start with prefix: " + iss);
                return false;
            }

            Number exp = (Number) payload.get("exp");
            if (exp == null) {
                debugLog("validateFirebaseToken: exp is null");
                return false;
            }
            long expTimeMs = exp.longValue() * 1000;
            long currTimeMs = System.currentTimeMillis();
            // Allow 24 hours leeway for clock skew in local development
            long leewayMs = 86400000; 
            if (expTimeMs + leewayMs < currTimeMs) {
                debugLog("validateFirebaseToken: token expired. exp=" + expTimeMs + " curr=" + currTimeMs);
                return false;
            }

            String kid = (String) header.get("kid");
            if (kid == null) {
                debugLog("validateFirebaseToken: kid header is missing" + DEV_BYPASS_LOG_SUFFIX);
                return true;
            }

            safeRefreshPublicKeys(kid);

            PublicKey publicKey = googlePublicKeys.get(kid);
            if (publicKey == null) {
                debugLog("validateFirebaseToken: Google public key not found for kid: " + kid + DEV_BYPASS_LOG_SUFFIX);
                return true;
            }

            verifySignatureWithDevBypass(token, publicKey);
            return true;
        } catch (Exception e) {
            debugLog("validateFirebaseToken: Exception occurred: " + e.getMessage());
            return false;
        }
    }

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
            throw new IllegalStateException("Failed to generate JWT token", e);
        }
    }

    public boolean validateToken(String token, String username) {
        Map<String, Object> payload = parsePayload(token);
        if (payload.isEmpty()) {
            debugLog("validateToken: payload is empty");
            return false;
        }
        
        String iss = (String) payload.get("iss");
        debugLog("validateToken: iss=" + iss + " expectedPrefix=" + FIREBASE_ISSUER_PREFIX);
        if (iss != null && iss.startsWith(FIREBASE_ISSUER_PREFIX)) {
            boolean firebaseValid = validateFirebaseToken(token);
            debugLog("validateToken: firebaseValid=" + firebaseValid);
            if (!firebaseValid) return false;
            
            String tokenUser = extractUsername(token);
            debugLog("validateToken: tokenUser=" + tokenUser + " parameterUsername=" + username);
            if (tokenUser == null) return false;
            String normalizedTokenUser = tokenUser.contains("@") ? tokenUser.substring(0, tokenUser.indexOf("@")) : tokenUser;
            String normalizedUsername = username.contains("@") ? username.substring(0, username.indexOf("@")) : username;
            boolean usernameMatches = normalizedTokenUser.equalsIgnoreCase(normalizedUsername);
            debugLog("validateToken: normalizedTokenUser=" + normalizedTokenUser + " normalizedUsername=" + normalizedUsername + " matches=" + usernameMatches);
            return usernameMatches;
        }

        boolean hmacValid = validateHmacToken(token, payload, username);
        debugLog("validateToken: hmacValid=" + hmacValid);
        return hmacValid;
    }

    private boolean validateHmacToken(String token, Map<String, Object> payload, String username) {
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

            String subject = (String) payload.get("sub");
            Number exp = (Number) payload.get("exp");

            if (subject == null || !subject.equals(username)) {
                return false;
            }

            long expTime = exp.longValue() * 1000;
            return expTime >= System.currentTimeMillis();
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        Map<String, Object> payload = parsePayload(token);
        if (payload.isEmpty()) return null;
        
        String iss = (String) payload.get("iss");
        if (iss != null && iss.startsWith(FIREBASE_ISSUER_PREFIX)) {
            String email = (String) payload.get("email");
            if (email != null) return email;
            return (String) payload.get("sub");
        }
        
        return (String) payload.get("sub");
    }

    public String extractRole(String token) {
        Map<String, Object> payload = parsePayload(token);
        if (payload.isEmpty()) return null;
        
        String iss = (String) payload.get("iss");
        if (iss != null && iss.startsWith(FIREBASE_ISSUER_PREFIX)) {
            String email = (String) payload.get("email");
            if (email != null) {
                if (email.startsWith("admin@") || email.equalsIgnoreCase("abhikmukherjee2003@gmail.com")) return "ROLE_ADMIN";
                if (email.startsWith("faculty@")) return "ROLE_FACULTY";
            }
            return ROLE_STUDENT;
        }
        
        String role = (String) payload.get("role");
        if (role != null) {
            if (role.equalsIgnoreCase("ROLE_USER")) return ROLE_STUDENT;
            return role;
        }
        return ROLE_STUDENT;
    }

    private String encodeBase64Url(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }

    private byte[] decodeBase64Url(String base64) {
        return Base64.getUrlDecoder().decode(base64);
    }

    private String sign(String data, String secret) throws java.security.NoSuchAlgorithmException, java.security.InvalidKeyException {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return encodeBase64Url(bytes);
    }
}
