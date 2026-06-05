package com.apex.atm.service;

import com.apex.atm.dto.DepositRequest;
import com.apex.atm.dto.TransactionResponse;
import com.apex.atm.dto.WithdrawRequest;

import java.util.List;

public interface TransactionService {
    TransactionResponse deposit(String userId, DepositRequest request);
    TransactionResponse withdraw(String userId, WithdrawRequest request);
    List<TransactionResponse> getTransactions(String userId, Integer limit);
}
