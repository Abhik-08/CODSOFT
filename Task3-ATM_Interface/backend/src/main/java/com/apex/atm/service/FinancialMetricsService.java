package com.apex.atm.service;

import com.apex.atm.dto.TransactionResponseDTO;
import com.apex.atm.dto.FinancialInsightsDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Comparator;

@Service
public class FinancialMetricsService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final String TYPE_DEBIT = "debit";
    private static final String TYPE_CREDIT = "credit";

    public void calculateMetrics(List<TransactionResponseDTO> txns, double currentBalance, FinancialInsightsDTO.FinancialInsightsDTOBuilder builder) {
        int totalTxns = txns.size();
        
        // General Stats
        double totalDeposits = txns.stream()
                .filter(t -> TYPE_CREDIT.equalsIgnoreCase(t.getType()))
                .mapToDouble(TransactionResponseDTO::getAmount).sum();

        double totalWithdrawals = txns.stream()
                .filter(t -> TYPE_DEBIT.equalsIgnoreCase(t.getType()))
                .mapToDouble(TransactionResponseDTO::getAmount).sum();

        long depositCount = txns.stream()
                .filter(t -> TYPE_CREDIT.equalsIgnoreCase(t.getType())).count();

        long withdrawalCount = txns.stream()
                .filter(t -> TYPE_DEBIT.equalsIgnoreCase(t.getType())).count();

        double averageDeposit = depositCount > 0 ? totalDeposits / depositCount : 0.0;
        double averageWithdrawal = withdrawalCount > 0 ? totalWithdrawals / withdrawalCount : 0.0;

        double savingsRatio = totalDeposits > 0 ? (totalDeposits - totalWithdrawals) / totalDeposits : 0.0;
        if (savingsRatio < 0) {
            savingsRatio = 0.0;
        }

        builder.currentBalance(currentBalance)
               .totalDeposits(totalDeposits)
               .totalWithdrawals(totalWithdrawals)
               .averageDeposit(averageDeposit)
               .averageWithdrawal(averageWithdrawal)
               .transactionCount(totalTxns)
               .savingsRatio(savingsRatio);

        // 1. Savings Score (0-100)
        int savingsScore = calculateSavingsScore(totalDeposits, totalWithdrawals, depositCount, withdrawalCount, totalTxns);
        builder.savingsScore(savingsScore)
               .savingsScoreExplanation(getSavingsScoreExplanation(savingsScore));

        // 2. Biggest Expense
        TransactionResponseDTO largestWithdrawal = txns.stream()
                .filter(t -> TYPE_DEBIT.equalsIgnoreCase(t.getType()))
                .max(Comparator.comparingDouble(TransactionResponseDTO::getAmount))
                .orElse(null);

        if (largestWithdrawal != null) {
            builder.largestWithdrawalAmount(largestWithdrawal.getAmount())
                   .largestWithdrawalDate(largestWithdrawal.getCreatedAt().format(DATE_FORMATTER));
        } else {
            builder.largestWithdrawalAmount(0.0)
                   .largestWithdrawalDate("N/A");
        }

        TransactionResponseDTO largestDeposit = txns.stream()
                .filter(t -> TYPE_CREDIT.equalsIgnoreCase(t.getType()))
                .max(Comparator.comparingDouble(TransactionResponseDTO::getAmount))
                .orElse(null);
        builder.largestDepositAmount(largestDeposit != null ? largestDeposit.getAmount() : 0.0);

        // 3. Weekly Spending (Last 7 days vs previous 7 days)
        calculateWeeklySpending(txns, builder);

        // 4. Monthly Spending
        calculateMonthlySpending(txns, builder);

        // 5. Financial Health Score (0-100)
        int healthScore = calculateFinancialHealthScore(currentBalance, savingsRatio, withdrawalCount, totalTxns);
        builder.financialHealthScore(healthScore)
               .financialHealthScoreExplanation(getFinancialHealthScoreExplanation(healthScore));

        // 6. Savings Projection
        calculateSavingsProjection(txns, currentBalance, totalDeposits, totalWithdrawals, builder);
    }

    private int calculateSavingsScore(double totalDeposits, double totalWithdrawals, long depositCount, long withdrawalCount, int totalTxns) {
        if (totalTxns == 0) return 50;
        if (totalDeposits <= 0) return 0;

        double savingsRatio = (totalDeposits - totalWithdrawals) / totalDeposits;
        double ratioScore = Math.clamp(savingsRatio, 0.0, 1.0) * 50.0;

        double depositFreqScore = ((double) depositCount / totalTxns) * 30.0;
        double withdrawalFreqScore = (1.0 - ((double) withdrawalCount / totalTxns)) * 20.0;

        return (int) Math.round(ratioScore + depositFreqScore + withdrawalFreqScore);
    }

    private String getSavingsScoreExplanation(int score) {
        if (score >= 80) {
            return "Strong saving habits with controlled spending.";
        } else if (score >= 50) {
            return "Moderate saving habits; try reducing minor withdrawals.";
        } else {
            return "High withdrawal frequency. Focus on building consistency in deposits.";
        }
    }

    private void calculateWeeklySpending(List<TransactionResponseDTO> txns, FinancialInsightsDTO.FinancialInsightsDTOBuilder builder) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentWeekStart = now.minusDays(6).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime previousWeekStart = now.minusDays(13).withHour(0).withMinute(0).withSecond(0);

        double currentWeekTotal = txns.stream()
                .filter(t -> TYPE_DEBIT.equalsIgnoreCase(t.getType())
                        && t.getCreatedAt().isAfter(currentWeekStart))
                .mapToDouble(TransactionResponseDTO::getAmount).sum();

        double previousWeekTotal = txns.stream()
                .filter(t -> TYPE_DEBIT.equalsIgnoreCase(t.getType())
                        && t.getCreatedAt().isAfter(previousWeekStart)
                        && t.getCreatedAt().isBefore(currentWeekStart))
                .mapToDouble(TransactionResponseDTO::getAmount).sum();

        double diffPercent = 0.0;
        if (previousWeekTotal > 0) {
            diffPercent = ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100.0;
        } else if (currentWeekTotal > 0) {
            diffPercent = 100.0;
        }

        builder.weeklySpendingCurrent(currentWeekTotal)
               .weeklySpendingPrevious(previousWeekTotal)
               .weeklySpendingDiffPercent(diffPercent);
    }

    private void calculateMonthlySpending(List<TransactionResponseDTO> txns, FinancialInsightsDTO.FinancialInsightsDTOBuilder builder) {
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        double monthlyDebits = txns.stream()
                .filter(t -> TYPE_DEBIT.equalsIgnoreCase(t.getType())
                        && t.getCreatedAt().getMonthValue() == currentMonth
                        && t.getCreatedAt().getYear() == currentYear)
                .mapToDouble(TransactionResponseDTO::getAmount).sum();

        double monthlyCredits = txns.stream()
                .filter(t -> TYPE_CREDIT.equalsIgnoreCase(t.getType())
                        && t.getCreatedAt().getMonthValue() == currentMonth
                        && t.getCreatedAt().getYear() == currentYear)
                .mapToDouble(TransactionResponseDTO::getAmount).sum();

        double ratio = monthlyDebits > 0 ? monthlyCredits / monthlyDebits : monthlyCredits;

        builder.monthlySpendingCurrent(monthlyDebits)
               .monthlyDepositWithdrawalRatio(ratio);
    }

    private int calculateFinancialHealthScore(double balance, double savingsRatio, long withdrawalCount, int totalTxns) {
        // Balance component (30 points)
        double balanceScore;
        if (balance >= 50000.0) {
            balanceScore = 30.0;
        } else if (balance >= 10000.0) {
            balanceScore = 15.0 + ((balance - 10000.0) / 40000.0) * 15.0;
        } else {
            balanceScore = Math.max(0.0, (balance / 10000.0) * 15.0);
        }

        // Savings Ratio component (40 points)
        double ratioScore;
        if (savingsRatio >= 0.5) {
            ratioScore = 40.0;
        } else {
            ratioScore = Math.max(0.0, (savingsRatio / 0.5) * 40.0);
        }

        // Transaction Pattern / Withdrawal Frequency component (30 points)
        double freqScore = totalTxns > 0 ? (1.0 - ((double) withdrawalCount / totalTxns)) * 30.0 : 30.0;

        return (int) Math.round(balanceScore + ratioScore + freqScore);
    }

    private String getFinancialHealthScoreExplanation(int score) {
        if (score >= 80) {
            return "Excellent financial health. Healthy balance reserve and positive savings trend.";
        } else if (score >= 50) {
            return "Good financial health. Monitor discretionary expenses to build a larger safety net.";
        } else {
            return "Unbalanced financial health. High outflow relative to income. Consider reducing withdrawals.";
        }
    }

    private void calculateSavingsProjection(List<TransactionResponseDTO> txns, double balance, double totalDeposits, double totalWithdrawals, FinancialInsightsDTO.FinancialInsightsDTOBuilder builder) {
        TransactionResponseDTO oldestTxn = txns.stream()
                .min(Comparator.comparing(TransactionResponseDTO::getCreatedAt))
                .orElse(null);

        if (oldestTxn == null) {
            builder.projectedAnnualSavings(balance)
                   .savingsProjectionExplanation("Based on your current transaction history, your net savings rate is zero or negative. At this rate, it is not possible to project savings.");
            return;
        }

        long daysBetween = ChronoUnit.DAYS.between(oldestTxn.getCreatedAt().toLocalDate(), LocalDate.now());
        double monthsElapsed = Math.max(1.0, daysBetween / 30.0);

        double netSavings = totalDeposits - totalWithdrawals;
        double monthlyAvgSavings = netSavings / monthsElapsed;

        if (monthlyAvgSavings <= 0) {
            builder.projectedAnnualSavings(balance)
                   .savingsProjectionExplanation("Based on your current transaction history, your net savings rate is zero or negative. At this rate, it is not possible to project savings.");
        } else {
            double projectedAnnualSavings = balance + (monthlyAvgSavings * 12.0);
            builder.projectedAnnualSavings(projectedAnnualSavings);

            if (balance >= 100000.0) {
                builder.savingsProjectionExplanation("You have already accumulated ₹1 lakh or more. You can comfortably maintain this safety net.");
            } else {
                double remaining = 100000.0 - balance;
                double monthsNeeded = remaining / monthlyAvgSavings;
                builder.savingsProjectionExplanation(String.format("At your current savings rate of ₹%,.0f/month, you may reach ₹1 lakh in approximately %.1f months.", monthlyAvgSavings, monthsNeeded));
            }
        }
    }
}
