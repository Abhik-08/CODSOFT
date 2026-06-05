package com.apex.atm.service.impl;

import com.apex.atm.dto.TransactionResponseDTO;
import com.apex.atm.repository.TransactionRepository;
import com.apex.atm.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;

    @Autowired
    public TransactionServiceImpl(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Override
    public TransactionResponseDTO logTransaction(String userId, String type, double amount, String description, double balanceAfterTransaction) {
        return transactionRepository.save(userId, type, amount, description, balanceAfterTransaction);
    }

    @Override
    public List<TransactionResponseDTO> getTransactions(String userId, String type, String sortBy, String direction, Integer page, Integer size) {
        return transactionRepository.findByUserId(userId, type, sortBy, direction, page, size);
    }
}
