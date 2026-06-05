package com.apex.atm.service;

import com.apex.atm.dto.BalanceResponseDTO;
import com.apex.atm.dto.TransactionResponseDTO;

import java.util.List;

public interface AccountService {
    BalanceResponseDTO getBalance(String userId);
    TransactionResponseDTO deposit(String userId, double amount, String description);
    TransactionResponseDTO withdraw(String userId, double amount, String description);
    List<TransactionResponseDTO> getTransactions(String userId, String type, String sortBy, String direction, Integer page, Integer size);
    void ensureAccountExists(String userId);
    void updateDailyLimit(String userId, double limit);
}
