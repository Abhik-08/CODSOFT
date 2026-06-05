package com.apex.atm.service;

import com.apex.atm.dto.DepositRequestDTO;
import com.apex.atm.dto.TransactionResponseDTO;
import com.apex.atm.dto.WithdrawRequestDTO;

import java.util.List;

public interface TransactionService {
    TransactionResponseDTO deposit(String userId, DepositRequestDTO request);
    TransactionResponseDTO withdraw(String userId, WithdrawRequestDTO request);
    List<TransactionResponseDTO> getTransactions(String userId, Integer limit);
}
