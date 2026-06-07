package com.apex.atm.service;

import com.apex.atm.dto.TransactionResponseDTO;
import com.apex.atm.dto.FinancialInsightsDTO;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class FinancialAnalysisService {

    private static final String TYPE_DEBIT = "debit";
    private static final String TYPE_CREDIT = "credit";

    public void analyzeBehavior(List<TransactionResponseDTO> txns, double currentBalance, FinancialInsightsDTO.FinancialInsightsDTOBuilder builder) {
        if (txns.isEmpty()) {
            builder.mostActiveDay("N/A")
                   .mostActiveWeek("N/A")
                   .withdrawalFrequency(0.0)
                   .depositFrequency(0.0)
                   .spendingTrend("stable")
                   .financialStabilityIndicator("Medium");
            return;
        }

        // 1. Most Active Day
        builder.mostActiveDay(determineMostActiveDay(txns));

        // 2. Spending Behavior (Most Active Week / Patterns)
        builder.mostActiveWeek(determineBehaviorPattern(txns));

        // 3. Frequencies
        TransactionResponseDTO oldestTxn = txns.stream()
                .min((t1, t2) -> t1.getCreatedAt().compareTo(t2.getCreatedAt()))
                .orElse(null);

        double monthsElapsed = 1.0;
        if (oldestTxn != null) {
            long daysBetween = ChronoUnit.DAYS.between(oldestTxn.getCreatedAt().toLocalDate(), LocalDate.now());
            monthsElapsed = Math.max(1.0, daysBetween / 30.0);
        }

        long totalDepositsCount = txns.stream().filter(t -> TYPE_CREDIT.equalsIgnoreCase(t.getType())).count();
        long totalWithdrawalsCount = txns.stream().filter(t -> TYPE_DEBIT.equalsIgnoreCase(t.getType())).count();

        builder.depositFrequency(totalDepositsCount / monthsElapsed)
               .withdrawalFrequency(totalWithdrawalsCount / monthsElapsed);

        // 4. Savings Trend
        analyzeSavingsTrend(txns, builder);

        // 5. Financial Stability Indicator
        builder.financialStabilityIndicator(determineStabilityIndicator(txns, currentBalance));
    }

    private String determineMostActiveDay(List<TransactionResponseDTO> txns) {
        return txns.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getCreatedAt().getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH),
                        Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
    }

    private String determineBehaviorPattern(List<TransactionResponseDTO> txns) {
        long weekendWithdrawals = txns.stream()
                .filter(t -> TYPE_DEBIT.equalsIgnoreCase(t.getType()) && 
                        (t.getCreatedAt().getDayOfWeek() == DayOfWeek.SATURDAY || 
                         t.getCreatedAt().getDayOfWeek() == DayOfWeek.SUNDAY))
                .count();

        long weekdayWithdrawals = txns.stream()
                .filter(t -> TYPE_DEBIT.equalsIgnoreCase(t.getType()) && 
                        t.getCreatedAt().getDayOfWeek() != DayOfWeek.SATURDAY && 
                        t.getCreatedAt().getDayOfWeek() != DayOfWeek.SUNDAY)
                .count();

        long firstWeekDeposits = txns.stream()
                .filter(t -> TYPE_CREDIT.equalsIgnoreCase(t.getType()) && t.getCreatedAt().getDayOfMonth() <= 7)
                .count();

        long otherWeekDeposits = txns.stream()
                .filter(t -> TYPE_CREDIT.equalsIgnoreCase(t.getType()) && t.getCreatedAt().getDayOfMonth() > 7)
                .count();

        if (weekendWithdrawals > weekdayWithdrawals && weekendWithdrawals > 0) {
            return "Your withdrawals mostly occur on weekends.";
        } else if (firstWeekDeposits > otherWeekDeposits && firstWeekDeposits > 0) {
            return "You tend to deposit money during the first week of every month.";
        } else {
            return "Your banking transactions are spread evenly throughout the weeks.";
        }
    }

    private String determineStabilityIndicator(List<TransactionResponseDTO> txns, double currentBalance) {
        double totalDepositsAmount = txns.stream()
                .filter(t -> TYPE_CREDIT.equalsIgnoreCase(t.getType()))
                .mapToDouble(TransactionResponseDTO::getAmount).sum();
        double totalWithdrawalsAmount = txns.stream()
                .filter(t -> TYPE_DEBIT.equalsIgnoreCase(t.getType()))
                .mapToDouble(TransactionResponseDTO::getAmount).sum();

        double overallSavingsRatio = totalDepositsAmount > 0 ? (totalDepositsAmount - totalWithdrawalsAmount) / totalDepositsAmount : 0.0;

        if (currentBalance >= 30000.0 && overallSavingsRatio >= 0.3) {
            return "High";
        } else if (currentBalance >= 10000.0 && overallSavingsRatio >= 0.1) {
            return "Medium";
        } else {
            return "Low";
        }
    }

    private void analyzeSavingsTrend(List<TransactionResponseDTO> txns, FinancialInsightsDTO.FinancialInsightsDTOBuilder builder) {
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        LocalDate prevMonthDate = now.minusMonths(1);
        int prevMonth = prevMonthDate.getMonthValue();
        int prevYear = prevMonthDate.getYear();

        double creditsCurrentMonth = txns.stream()
                .filter(t -> TYPE_CREDIT.equalsIgnoreCase(t.getType())
                        && t.getCreatedAt().getMonthValue() == currentMonth
                        && t.getCreatedAt().getYear() == currentYear)
                .mapToDouble(TransactionResponseDTO::getAmount).sum();

        double debitsCurrentMonth = txns.stream()
                .filter(t -> TYPE_DEBIT.equalsIgnoreCase(t.getType())
                        && t.getCreatedAt().getMonthValue() == currentMonth
                        && t.getCreatedAt().getYear() == currentYear)
                .mapToDouble(TransactionResponseDTO::getAmount).sum();

        double creditsPrevMonth = txns.stream()
                .filter(t -> TYPE_CREDIT.equalsIgnoreCase(t.getType())
                        && t.getCreatedAt().getMonthValue() == prevMonth
                        && t.getCreatedAt().getYear() == prevYear)
                .mapToDouble(TransactionResponseDTO::getAmount).sum();

        double debitsPrevMonth = txns.stream()
                .filter(t -> TYPE_DEBIT.equalsIgnoreCase(t.getType())
                        && t.getCreatedAt().getMonthValue() == prevMonth
                        && t.getCreatedAt().getYear() == prevYear)
                .mapToDouble(TransactionResponseDTO::getAmount).sum();

        double netSavingsCurrent = creditsCurrentMonth - debitsCurrentMonth;
        double netSavingsPrev = creditsPrevMonth - debitsPrevMonth;

        if (netSavingsCurrent > netSavingsPrev) {
            builder.spendingTrend("improving");
        } else if (netSavingsCurrent < netSavingsPrev) {
            builder.spendingTrend("declining");
        } else {
            builder.spendingTrend("stable");
        }
    }
}
