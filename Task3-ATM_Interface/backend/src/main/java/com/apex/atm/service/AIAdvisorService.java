package com.apex.atm.service;

import com.apex.atm.dto.ChatResponse;
import com.apex.atm.dto.FinancialInsightsDTO;
import com.apex.atm.dto.TransactionResponseDTO;
import com.apex.atm.dto.BalanceResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AIAdvisorService {

    private final GeminiService geminiService;
    private final AccountService accountService;
    private final FinancialMetricsService financialMetricsService;
    private final FinancialAnalysisService financialAnalysisService;

    private static final String REFUSAL_REPLY = 
            "I am Nexus Financial Intelligence. I can only assist with banking activity, spending analysis, savings planning, and financial insights.";

    @Autowired
    public AIAdvisorService(GeminiService geminiService,
                            AccountService accountService,
                            FinancialMetricsService financialMetricsService,
                            FinancialAnalysisService financialAnalysisService) {
        this.geminiService = geminiService;
        this.accountService = accountService;
        this.financialMetricsService = financialMetricsService;
        this.financialAnalysisService = financialAnalysisService;
    }

    public ChatResponse generateAdvisorResponse(String userId, String userMessage) {
        // Step 1: Pre-validation Refusal Check (Defense in Depth)
        if (isUnrelated(userMessage)) {
            return ChatResponse.builder()
                    .reply(REFUSAL_REPLY)
                    .timestamp(LocalDateTime.now().toString())
                    .build();
        }

        try {
            // Step 2: Fetch Current Balance
            BalanceResponseDTO balanceDTO = accountService.getBalance(userId);
            double currentBalance = balanceDTO != null ? balanceDTO.getBalance() : 0.0;

            // Step 3: Fetch up to 100 recent transactions
            List<TransactionResponseDTO> txns = accountService.getTransactions(userId, null, "createdAt", "DESC", 0, 100);

            // Step 4: Pre-process financial metrics and behaviors
            FinancialInsightsDTO.FinancialInsightsDTOBuilder builder = FinancialInsightsDTO.builder();
            financialMetricsService.calculateMetrics(txns, currentBalance, builder);
            financialAnalysisService.analyzeBehavior(txns, currentBalance, builder);
            FinancialInsightsDTO insights = builder.build();

            // Step 5: Build Gemini System Context & Prompt
            String prompt = buildSystemPrompt(insights, txns, userMessage);

            // Step 6: Invoke Gemini
            String reply = geminiService.generate(prompt);

            // Step 7: Handle fallback error or formatting
            if ("ERROR".equals(reply) || reply == null || reply.trim().isEmpty()) {
                reply = "I apologize, but I am currently unable to access your real-time transaction analysis. Please try again in a moment.";
            } else {
                reply = reply.trim();
            }

            return ChatResponse.builder()
                    .reply(reply)
                    .timestamp(LocalDateTime.now().toString())
                    .build();

        } catch (Exception e) {
            return ChatResponse.builder()
                    .reply("I apologize, but I encountered an error while analyzing your transaction history. Please try again in a moment.")
                    .timestamp(LocalDateTime.now().toString())
                    .build();
        }
    }

    private boolean isUnrelated(String msg) {
        if (msg == null) return false;
        String lower = msg.toLowerCase().trim();

        // Allow greetings and casual short messages — let Gemini handle them gracefully
        if (lower.length() < 30) return false;

        // Allow anything with clear financial intent
        if (lower.contains("spend") || lower.contains("saving") || lower.contains("balance") ||
                lower.contains("deposit") || lower.contains("withdraw") || lower.contains("transaction") ||
                lower.contains("account") || lower.contains("money") || lower.contains("rupee") ||
                lower.contains("paisa") || lower.contains("paise") || lower.contains("invest") ||
                lower.contains("limit") || lower.contains("score") || lower.contains("lakh") ||
                lower.contains("expense") || lower.contains("salary")) {
            return false;
        }

        // Block only clear off-topic technical / trivia requests
        if (lower.contains("write code") || lower.contains("programming language") ||
                lower.contains("teach me java") || lower.contains("what is dbms") ||
                lower.contains("write python") || lower.contains("write java") ||
                lower.contains("who won the world cup") || lower.contains("who won the worldcup")) {
            return true;
        }

        // Generic keyword checks for coding / trivia (only for longer messages)
        return lower.matches(".*\\b(dbms|python|javascript|sql|c\\+\\+|programming|coding|world cup|worldcup|football|cricket|weather)\\b.*");
    }

    private String buildSystemPrompt(FinancialInsightsDTO insights, List<TransactionResponseDTO> txns, String userMessage) {
        String weeklyDiffStr;
        if (insights.getWeeklySpendingDiffPercent() > 0) {
            weeklyDiffStr = String.format("%.1f%% higher than last week", insights.getWeeklySpendingDiffPercent());
        } else if (insights.getWeeklySpendingDiffPercent() < 0) {
            weeklyDiffStr = String.format("%.1f%% lower than last week", Math.abs(insights.getWeeklySpendingDiffPercent()));
        } else {
            weeklyDiffStr = "No change or same as last week";
        }

        String monthlyRatioStr = insights.getMonthlyDepositWithdrawalRatio() > 0 
                ? String.format("%.2f (Deposits/Withdrawals)", insights.getMonthlyDepositWithdrawalRatio())
                : "N/A (No withdrawals recorded)";

        String biggestExpenseStr = !"N/A".equals(insights.getLargestWithdrawalDate())
                ? String.format("₹%,.2f on %s", insights.getLargestWithdrawalAmount(), insights.getLargestWithdrawalDate())
                : "No debit transactions found";

        String recentTxnsFormatted = txns.stream()
                .limit(20) // Only send recent 20 details to not overload token context
                .map(t -> String.format("- %s | %s | ₹%,.2f | %s",
                        t.getCreatedAt().toLocalDate(),
                        t.getType().toUpperCase(),
                        t.getAmount(),
                        t.getDescription() != null ? t.getDescription() : ""))
                .collect(Collectors.joining("\n"));

        return """
        You are the NEXUS FINANCIAL INTELLIGENCE SYSTEM, a premium banking advisor and personal financial coach for NEXUS VAULT.
        Your goal is to answer the user's financial questions and help them coach their habits using actual, real transaction data.

        AI PERSONALITY & RESPONSE STYLE:
        - Act as a premium, elite banking advisor.
        - Sound professional, coach-like, intelligent, and empathetic.
        - Ground all answers in the actual user data provided below. NEVER invent facts or make up fake numbers.
        - Avoid generic AI fluff, chatty intro paragraphs, or motivational clichés. Speak with real data and numbers.
        - Always use the '₹' symbol for Indian Rupees.

        HANDLING GREETINGS AND CASUAL MESSAGES:
        - If the user sends a greeting (hi, hello, hey, hii, kaisa, kya haal, sup, good morning, etc.) or any casual/informal message,
          respond in a warm, friendly, brief manner and naturally introduce yourself and your capabilities.
          Example: "Hey! I'm Nexus, your personal financial intelligence system. How can I help with your finances today?"
        - If the user's message is casual banter, informal slang, or just chatting (even in Hindi/Hinglish), respond naturally and steer toward banking.
        - Do NOT give a cold robotic refusal for greetings or short casual messages.

        STRICT TOPIC RESTRICTIONS:
        - You must ONLY assist with banking activity, spending analysis, savings planning, transaction analysis, and account insights.
        - If the user's message is clearly off-topic (e.g. asking programming questions, DBMS, general knowledge, sports, celebrities, writing code, jokes), you MUST respond with EXACTLY this refusal message and nothing else:
          "I am Nexus Financial Intelligence. I can only assist with banking activity, spending analysis, savings planning, and financial insights."

        PRE-PROCESSED REAL-TIME USER DATA:
        - Current Balance: ₹%,.2f
        - Total Deposits: ₹%,.2f
        - Total Withdrawals: ₹%,.2f
        - Average Deposit: ₹%,.2f
        - Average Withdrawal: ₹%,.2f
        - Weekly Spending (This Week): ₹%,.2f
        - Weekly Spending (Last Week): ₹%,.2f
        - Weekly Spending Difference: %s
        - Monthly Spending (Current Month): ₹%,.2f
        - Deposit vs Withdrawal Ratio (Current Month): %s
        - Largest Withdrawal (Biggest Expense): %s
        - Largest Deposit: ₹%,.2f
        - Transaction Count: %d
        - Savings Score: %d/100 (%s)
        - Financial Health Score: %d/100 (%s)
        - Savings Ratio: %.2f (overall deposits to withdrawals ratio)
        - Savings Projection: %s
        - Most Active Day: %s
        - Spending Pattern Behavior: %s
        - Average Monthly Deposit Frequency: %.2f times
        - Average Monthly Withdrawal Frequency: %.2f times
        - Spending Trend: %s
        - Financial Stability Indicator: %s

        RECENT TRANSACTIONS (Newest First):
        %s

        USER QUERY: %s
        """.formatted(
                insights.getCurrentBalance(),
                insights.getTotalDeposits(),
                insights.getTotalWithdrawals(),
                insights.getAverageDeposit(),
                insights.getAverageWithdrawal(),
                insights.getWeeklySpendingCurrent(),
                insights.getWeeklySpendingPrevious(),
                weeklyDiffStr,
                insights.getMonthlySpendingCurrent(),
                monthlyRatioStr,
                biggestExpenseStr,
                insights.getLargestDepositAmount(),
                insights.getTransactionCount(),
                insights.getSavingsScore(),
                insights.getSavingsScoreExplanation(),
                insights.getFinancialHealthScore(),
                insights.getFinancialHealthScoreExplanation(),
                insights.getSavingsRatio(),
                insights.getSavingsProjectionExplanation(),
                insights.getMostActiveDay(),
                insights.getMostActiveWeek(),
                insights.getDepositFrequency(),
                insights.getWithdrawalFrequency(),
                insights.getSpendingTrend(),
                insights.getFinancialStabilityIndicator(),
                recentTxnsFormatted,
                userMessage
        );
    }
}
