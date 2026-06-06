package com.apex.atm.service;

import com.apex.atm.dto.ChatResponse;
import com.apex.atm.dto.TransactionResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Month;
import java.time.LocalDate;
import java.util.List;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final GeminiService geminiService;
    private final AccountService accountService;

    @Autowired
    public ChatService(GeminiService geminiService, AccountService accountService) {
        this.geminiService = geminiService;
        this.accountService = accountService;
    }

    public ChatResponse chat(String userId, String userMessage) {
        // Step 1 - fetch transactions
        List<TransactionResponseDTO> txns = accountService.getTransactions(userId, null, "createdAt", "DESC", 0, 20);

        // Step 2 - call buildPrompt
        String prompt = buildPrompt(txns, userMessage);

        // Step 3 - call geminiService.generate(prompt)
        String reply = geminiService.generate(prompt);

        // Step 4 - if "ERROR" -> fallback reply
        if ("ERROR".equals(reply) || reply == null) {
            reply = "Sorry, I'm having trouble connecting. Please try again.";
        }

        // Step 5 - return ChatResponse
        return ChatResponse.builder()
                .reply(reply)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    private String buildPrompt(List<TransactionResponseDTO> txns, String userMessage) {
        Month currentMonth = LocalDate.now().getMonth();
        int currentYear = LocalDate.now().getYear();

        double monthlyCredits = txns.stream()
                .filter(t -> "credit".equalsIgnoreCase(t.getType())
                        && t.getCreatedAt().getMonth() == currentMonth
                        && t.getCreatedAt().getYear() == currentYear)
                .mapToDouble(TransactionResponseDTO::getAmount).sum();

        double monthlyDebits = txns.stream()
                .filter(t -> "debit".equalsIgnoreCase(t.getType())
                        && t.getCreatedAt().getMonth() == currentMonth
                        && t.getCreatedAt().getYear() == currentYear)
                .mapToDouble(TransactionResponseDTO::getAmount).sum();

        long totalDepositCount = txns.stream()
                .filter(t -> "credit".equalsIgnoreCase(t.getType())).count();

        String largestTxn = txns.stream()
                .max(Comparator.comparingDouble(TransactionResponseDTO::getAmount))
                .map(t -> "₹" + t.getAmount() + " (" + t.getType() + ") on " + t.getCreatedAt().toLocalDate())
                .orElse("No transactions found");

        String currentBalance = txns.isEmpty() ? "unavailable"
                : "₹" + txns.get(0).getPostTransactionBalance();

        String txnLines = txns.stream()
                .map(t -> t.getCreatedAt().toLocalDate() + " | "
                        + t.getType().toUpperCase() + " | ₹" + t.getAmount()
                        + (t.getDescription() != null ? " | " + t.getDescription() : ""))
                .collect(Collectors.joining("\n"));

        return """
                You are NEXUS, a smart and friendly AI assistant built into the Nexus Vault app.
                You are powered by Gemini and can answer anything — just like ChatGPT.
                You also have access to the user's real bank account data as extra context.

                LANGUAGE RULE:
                - Auto-detect the user's language from their message
                - Always reply in the exact same language they used
                - Hindi → Hindi, Bengali → Bengali, Hinglish → Hinglish, English → English
                - Match their tone — casual stays casual, formal stays formal
                - Use emojis naturally when the conversation is casual

                GREETING RULE:
                - Any greeting in any language → respond warmly and casually
                - "kya bhai", "hi", "hello", "কেমন আছ", "namaste" etc →
                  friendly reply in their language, offer to help

                HOW TO USE ACCOUNT DATA:
                - If the user's question is related to their money, account, transactions,
                  affordability, savings, or budgeting → use the account data below to
                  give a personalized answer with real numbers
                - If the question has nothing to do with banking → just answer it normally
                  like a general AI assistant, ignore the account data
                - Never say "I don't have enough data" — you always have enough to help

                AFFORDABILITY LOGIC (use when user asks "can I afford X?"):
                - amount < 20%% of balance → "Yes, comfortably affordable"
                - amount 20–50%% of balance → "Affordable but will impact savings"
                - amount 50–100%% of balance → "Risky, big impact on balance"
                - amount > balance → "Insufficient balance"
                Always show actual ₹ numbers and reasoning.

                TONE & STYLE:
                - Friendly, conversational, like a smart friend
                - Never robotic, never overly formal
                - 3–4 sentences for most answers
                - Use ₹ for Indian currency amounts
                - Be empathetic if user seems stressed about money

                USER'S ACCOUNT DATA (use for finance questions):
                - Current balance: %s
                - This month credits: ₹%s
                - This month debits: ₹%s
                - Total deposits ever: %d
                - Largest transaction: %s

                RECENT TRANSACTIONS (last 20, newest first):
                %s

                USER MESSAGE: %s
                """.formatted(currentBalance, monthlyCredits, monthlyDebits,
                totalDepositCount, largestTxn, txnLines, userMessage);
    }
}
