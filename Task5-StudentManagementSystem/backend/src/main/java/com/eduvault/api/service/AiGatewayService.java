package com.eduvault.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@Slf4j
public class AiGatewayService {

    private final AiProviderRouter aiProviderRouter;
    private final AiFallbackHandler aiFallbackHandler;
    private final AiResponseMapper aiResponseMapper;
    private final AiPromptBuilder aiPromptBuilder;

    public AiGatewayService(
            AiProviderRouter aiProviderRouter,
            AiFallbackHandler aiFallbackHandler,
            AiResponseMapper aiResponseMapper,
            AiPromptBuilder aiPromptBuilder) {
        this.aiProviderRouter = aiProviderRouter;
        this.aiFallbackHandler = aiFallbackHandler;
        this.aiResponseMapper = aiResponseMapper;
        this.aiPromptBuilder = aiPromptBuilder;
    }

    public static class GatewayResponse {
        private final String reply;
        private final String provider;
        private final String model;
        private final long responseTime;
        private final int tokensUsed;

        public GatewayResponse(String reply, String provider, String model, long responseTime, int tokensUsed) {
            this.reply = reply;
            this.provider = provider;
            this.model = model;
            this.responseTime = responseTime;
            this.tokensUsed = tokensUsed;
        }

        public String getReply() { return reply; }
        public String getProvider() { return provider; }
        public String getModel() { return model; }
        public long getResponseTime() { return responseTime; }
        public int getTokensUsed() { return tokensUsed; }
    }

    public GatewayResponse handleChat(String userMessage) {
        long startTime = System.currentTimeMillis();
        String systemInstruction = aiPromptBuilder.buildSystemPrompt();

        // Check for Greetings or Out-of-Domain queries directly before invoking model
        String queryLower = userMessage == null ? "" : userMessage.toLowerCase().trim();
        if (isOutOfDomain(queryLower)) {
            long duration = System.currentTimeMillis() - startTime;
            return new GatewayResponse(
                "I am EduVault Academic Copilot and currently support questions related to student records, analytics, portfolios, attendance, placements, skills, certificates, and academic performance.",
                "system",
                "rules-engine",
                duration,
                0
            );
        }

        List<AiProviderRouter.ModelTarget> chain = aiProviderRouter.determineModelChain(userMessage);
        
        Exception lastException = null;
        for (AiProviderRouter.ModelTarget target : chain) {
            try {
                log.info("Attempting AI generation with: {} ({})", target.getDisplayName(), target.getModelName());
                
                String rawResponse = aiFallbackHandler.callProvider(
                    target.getProvider(),
                    target.getModelName(),
                    systemInstruction,
                    userMessage
                );

                String reply = aiResponseMapper.extractReply(target.getProvider(), rawResponse);
                if (reply != null && !reply.isBlank()) {
                    long duration = System.currentTimeMillis() - startTime;
                    int tokens = aiResponseMapper.extractTokensUsed(target.getProvider(), rawResponse);
                    
                    log.info("Request completed successfully using provider={}, model={}, time={}ms",
                            target.getProvider(), target.getModelName(), duration);
                    
                    return new GatewayResponse(
                        reply,
                        target.getProvider(),
                        target.getModelName(),
                        duration,
                        tokens
                    );
                }
            } catch (Exception e) {
                log.warn("AI Model {} failed: {}. Trying fallback model if available.", 
                        target.getDisplayName(), e.getMessage());
                lastException = e;
            }
        }

        // If all fail, return a user friendly fallback message
        long duration = System.currentTimeMillis() - startTime;
        String fallbackMsg = "All AI models are currently unavailable. Please check backend connection logs or API key configuration.";
        if (lastException != null) {
            log.error("All AI providers in gateway failed. Last error: {}", lastException.getMessage());
        }
        return new GatewayResponse(
            fallbackMsg,
            "fallback",
            "none",
            duration,
            0
        );
    }

    private boolean isOutOfDomain(String query) {
        // Simple heuristic matching the prompt builder out-of-domain strictures
        return query.contains("movie") || query.contains("film") || query.contains("politics") 
                || query.contains("cricket") || query.contains("football") || query.contains("sports")
                || query.contains("weather") || query.contains("weather forecast") 
                || query.contains("write python code to") && !query.contains("student")
                || query.contains("explain black hole") || query.contains("who is president");
    }
}
