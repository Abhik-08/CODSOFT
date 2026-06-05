package com.apex.atm.service;

import com.apex.atm.dto.TransactionResponseDTO;
import java.util.List;

public interface TransactionService {
    TransactionResponseDTO logTransaction(String userId, String type, double amount, String description, double balanceAfterTransaction);
    List<TransactionResponseDTO> getTransactions(String userId, String type, String sortBy, String direction, Integer page, Integer size);
}
