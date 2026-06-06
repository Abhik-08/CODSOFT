package com.apex.atm.service;

import com.apex.atm.dto.InsightResponse;
import com.apex.atm.dto.TransactionResponseDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Comparator;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.format.TextStyle;
import java.util.Locale;

@Service
public class InsightService {

    private final GeminiService geminiService;
    private final AccountService accountService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public InsightService(GeminiService geminiService, AccountService accountService) {
        this.geminiService = geminiService;
        this.accountService = accountService;
    }

    public InsightResponse generateInsights(String userId) {
        try {
            // Step 1 — fetch transactions
            List<TransactionResponseDTO> txns = accountService.getTransactions(userId, null, "createdAt", "DESC", 0, 30);

            // Step 2 — call buildPrompt(txns)
            String prompt = buildPrompt(txns);

            // Step 3 — call geminiService.generate(prompt)
            String response = geminiService.generate(prompt);

            // Step 4 — if "ERROR" -> return fallback with errorMessage = "AI analysis unavailable"
            if ("ERROR".equals(response) || response == null) {
                return createFallback("AI analysis unavailable");
            }

            // Step 5 — strip fences: response.replaceAll("```json|```", "").trim()
            String cleanedResponse = response.replaceAll("```json|```", "").trim();

            // Step 6 — parse with Jackson ObjectMapper into InsightResponse
            return objectMapper.readValue(cleanedResponse, InsightResponse.class);

        } catch (Exception e) {
            // Step 7 — on parse failure / any exception -> return fallback with errorMessage = "Could not parse AI response"
            return createFallback("Could not parse AI response");
        }
    }

    private String buildPrompt(List<TransactionResponseDTO> txns) {
        double totalCredits = txns.stream()
            .filter(t -> "credit".equalsIgnoreCase(t.getType()))
            .mapToDouble(TransactionResponseDTO::getAmount).sum();

        double totalDebits = txns.stream()
            .filter(t -> "debit".equalsIgnoreCase(t.getType()))
            .mapToDouble(TransactionResponseDTO::getAmount).sum();

        int count = txns.size();

        String dateRange = txns.isEmpty() ? "N/A" :
            txns.get(txns.size() - 1).getCreatedAt().toLocalDate() + " to " +
            txns.get(0).getCreatedAt().toLocalDate();

        String largestStr = txns.stream()
            .max(Comparator.comparingDouble(TransactionResponseDTO::getAmount))
            .map(t -> "₹" + t.getAmount() + " (" + t.getType() + ") on " + t.getCreatedAt().toLocalDate())
            .orElse("N/A");

        String mostActiveDay = txns.stream()
            .collect(Collectors.groupingBy(
                t -> t.getCreatedAt().getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH),
                Collectors.counting()))
            .entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("N/A");

        return """
        You are a financial analysis AI for APEX ATM.
        Analyze the transaction data below and respond ONLY with a valid JSON object.
        No markdown, no explanation, no text outside the JSON.

        Transaction Data:
        - Total Credits (deposits): ₹%s
        - Total Debits (withdrawals): ₹%s
        - Transaction Count: %d
        - Date Range: %s
        - Largest Transaction: %s
        - Most Active Day: %s

        Scoring rule:
        - debits < 40%% of credits → financialScore 80–100
        - debits 40–70%% of credits → financialScore 50–79
        - debits > 70%% of credits → financialScore 0–49

        If data is empty return financialScore 0 and
        summary: "Not enough transaction data to generate insights."
        Never invent numbers not in the data above.

        Respond with EXACTLY this JSON, no extra fields:
        {
          "summary": "2-3 sentence plain English analysis",
          "recommendations": ["tip 1", "tip 2", "tip 3"],
          "riskLevel": "Low" or "Medium" or "High",
          "financialScore": integer 0–100,
          "mostActiveDay": "e.g. Monday",
          "largestTransaction": "e.g. ₹5000 (debit) on 2025-05-10"
        }
        """.formatted(totalCredits, totalDebits, count, dateRange, largestStr, mostActiveDay);
    }

    private InsightResponse createFallback(String errorMsg) {
        return InsightResponse.builder()
                .errorMessage(errorMsg)
                .build();
    }
}
