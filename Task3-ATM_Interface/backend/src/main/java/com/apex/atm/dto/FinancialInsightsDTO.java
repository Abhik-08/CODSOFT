package com.apex.atm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialInsightsDTO {
    // General Stats
    private double currentBalance;
    private double totalDeposits;
    private double totalWithdrawals;
    private double averageDeposit;
    private double averageWithdrawal;
    private int transactionCount;
    private double savingsRatio;

    // Weekly Spending
    private double weeklySpendingCurrent;
    private double weeklySpendingPrevious;
    private double weeklySpendingDiffPercent;

    // Monthly Spending
    private double monthlySpendingCurrent;
    private double monthlyDepositWithdrawalRatio;

    // Largest Transactions
    private double largestWithdrawalAmount;
    private String largestWithdrawalDate;
    private double largestDepositAmount;

    // Scores & Projections
    private int savingsScore;
    private String savingsScoreExplanation;
    private int financialHealthScore;
    private String financialHealthScoreExplanation;
    private double projectedAnnualSavings;
    private String savingsProjectionExplanation;

    // Spending Behavior
    private String mostActiveDay;
    private String mostActiveWeek;
    private double withdrawalFrequency; // average count/month
    private double depositFrequency;    // average count/month
    private String spendingTrend;        // "improving", "stable", "declining"
    private String financialStabilityIndicator; // "High", "Medium", "Low"
}
