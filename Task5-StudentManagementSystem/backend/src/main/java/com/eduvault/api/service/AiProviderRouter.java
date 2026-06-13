package com.eduvault.api.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class AiProviderRouter {

    private static final String PROVIDER_GEMINI = "gemini";
    private static final String PROVIDER_GROQ = "groq";

    public static class ModelTarget {
        private final String provider;
        private final String modelName;
        private final String displayName;

        public ModelTarget(String provider, String modelName, String displayName) {
            this.provider = provider;
            this.modelName = modelName;
            this.displayName = displayName;
        }

        public String getProvider() { return provider; }
        public String getModelName() { return modelName; }
        public String getDisplayName() { return displayName; }
    }

    public List<ModelTarget> determineModelChain(String prompt) {
        String query = prompt == null ? "" : prompt.toLowerCase().trim();
        List<ModelTarget> chain = new ArrayList<>();

        if (isGreeting(query)) {
            // Cheap fast requests: Gemini 2.5 Flash Lite -> Gemini 2.5 Flash -> Groq Llama 8B
            chain.add(new ModelTarget(PROVIDER_GEMINI, "gemini-2.5-flash-lite", "Gemini Flash Lite"));
            chain.add(new ModelTarget(PROVIDER_GEMINI, "gemini-2.5-flash", "Gemini Flash"));
            chain.add(new ModelTarget(PROVIDER_GROQ, "llama-3.1-8b-instant", "Groq Llama 8B"));
        } else if (isComplexInsight(query)) {
            // Complex Insights: Gemini 2.5 Pro -> Groq Qwen QWQ
            chain.add(new ModelTarget(PROVIDER_GEMINI, "gemini-2.5-pro", "Gemini Pro"));
            chain.add(new ModelTarget(PROVIDER_GROQ, "qwen-qwq-32b", "Groq Qwen QWQ"));
        } else if (isAnalyticsQuery(query)) {
            // Analytics: Gemini 2.5 Pro -> Groq DeepSeek R1
            chain.add(new ModelTarget(PROVIDER_GEMINI, "gemini-2.5-pro", "Gemini Pro"));
            chain.add(new ModelTarget(PROVIDER_GROQ, "deepseek-r1-distill-llama-70b", "Groq DeepSeek R1"));
        } else {
            // General cohort/student questions: Gemini 2.5 Flash -> Groq Llama 70B
            chain.add(new ModelTarget(PROVIDER_GEMINI, "gemini-2.5-flash", "Gemini Flash"));
            chain.add(new ModelTarget(PROVIDER_GROQ, "llama-3.3-70b-versatile", "Groq Llama 70B"));
        }

        return chain;
    }

    private boolean isGreeting(String query) {
        return query.startsWith("hi") || query.startsWith("hello") || query.startsWith("hey")
                || query.contains("good morning") || query.contains("good evening")
                || query.contains("what can you do") || query.contains("help")
                || query.contains("introduce yourself");
    }

    private boolean isComplexInsight(String query) {
        return query.contains("roadmap") || query.contains("timeline") || query.contains("progression") 
                || query.contains("career path") || query.contains("plan");
    }

    private boolean isAnalyticsQuery(String query) {
        return query.contains("average") || query.contains("mean") || query.contains("analytics") 
                || query.contains("stats") || query.contains("trend") || query.contains("distribution")
                || query.contains("comparison") || query.contains("percentage");
    }
}
