package com.apex.atm.repository;

import com.apex.atm.dto.TransactionResponseDTO;
import com.google.cloud.firestore.Transaction;
import java.util.List;

public interface TransactionRepository {
    String save(Transaction txn, String userId, String type, double amount, String description, double balanceAfterTransaction);
    TransactionResponseDTO save(String userId, String type, double amount, String description, double balanceAfterTransaction);
    List<TransactionResponseDTO> findByUserId(String userId, String type, String sortBy, String direction, Integer page, Integer size);
    double getTodayWithdrawnAmount(String userId);
}
