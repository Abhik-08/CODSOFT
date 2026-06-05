package com.apex.atm.service.impl;

import com.apex.atm.dto.BalanceResponseDTO;
import com.apex.atm.dto.TransactionResponseDTO;
import com.apex.atm.exception.DailyLimitExceededException;
import com.apex.atm.exception.InsufficientBalanceException;
import com.apex.atm.exception.AccountNotFoundException;
import com.apex.atm.exception.InvalidAmountException;
import com.apex.atm.exception.AtmException;
import com.apex.atm.repository.AccountRepository;
import com.apex.atm.repository.TransactionRepository;
import com.apex.atm.service.AccountService;
import com.apex.atm.service.FirestoreService;
import com.google.cloud.firestore.Firestore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AccountServiceImpl implements AccountService {

    private static final Logger logger = LoggerFactory.getLogger(AccountServiceImpl.class);
    private static final double DAILY_WITHDRAWAL_LIMIT = 20000.0;

    private static final String TYPE_CREDIT = "credit";
    private static final String TYPE_DEBIT = "debit";

    private final FirestoreService firestoreService;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Autowired
    public AccountServiceImpl(FirestoreService firestoreService,
                              AccountRepository accountRepository,
                              TransactionRepository transactionRepository) {
        this.firestoreService = firestoreService;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public BalanceResponseDTO getBalance(String userId) {
        try {
            Double balance = accountRepository.getBalance(userId)
                    .orElseGet(() -> {
                        accountRepository.ensureExists(userId);
                        return 50000.0;
                    });

            return BalanceResponseDTO.builder()
                    .userId(userId)
                    .balance(balance)
                    .lastUpdatedAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            if (e instanceof InterruptedException || e.getCause() instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            logger.error("Error retrieving balance for user: {}", userId, e);
            throw new AccountNotFoundException("Unable to retrieve checking account: " + e.getMessage());
        }
    }

    @Override
    public TransactionResponseDTO deposit(String userId, double amount, String description) {
        if (amount <= 0) {
            throw new InvalidAmountException("Deposit amount must be greater than zero");
        }
        
        Firestore db = firestoreService.getDb();
        String desc = description != null ? description : "Cash Deposit";

        try {
            String[] txnIdHolder = new String[1];
            double postBalance = db.runTransaction(transaction -> {
                double currentBalance = accountRepository.getBalance(transaction, userId).orElse(0.0);
                double newBalance = currentBalance + amount;

                // Update checking account balance
                accountRepository.updateBalance(transaction, userId, newBalance);

                // Log audit ledger record
                txnIdHolder[0] = transactionRepository.save(transaction, userId, TYPE_CREDIT, amount, desc, newBalance);
                return newBalance;
            }).get();

            return TransactionResponseDTO.builder()
                    .id(txnIdHolder[0])
                    .type(TYPE_CREDIT)
                    .amount(amount)
                    .description(desc)
                    .createdAt(LocalDateTime.now())
                    .postTransactionBalance(postBalance)
                    .build();

        } catch (Exception e) {
            if (e instanceof InterruptedException || e.getCause() instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            logger.error("Deposit transaction failed in Firestore: {}", e.getMessage(), e);
            throw new AtmException("Transaction failure during cash deposit: " + e.getMessage());
        }
    }

    @Override
    public TransactionResponseDTO withdraw(String userId, double amount, String description) {
        if (amount <= 0) {
            throw new InvalidAmountException("Withdrawal amount must be greater than zero");
        }

        Firestore db = firestoreService.getDb();
        String desc = description != null ? description : "Cash Withdrawal";

        try {
            // Velocity limit check
            double todayWithdrawn = transactionRepository.getTodayWithdrawnAmount(userId);
            if (todayWithdrawn + amount > DAILY_WITHDRAWAL_LIMIT) {
                throw new DailyLimitExceededException("Withdrawal failed: Exceeds daily ATM limit of $" 
                        + DAILY_WITHDRAWAL_LIMIT + ". Already withdrawn in last 24h: $" + todayWithdrawn);
            }

            String[] txnIdHolder = new String[1];
            double postBalance = db.runTransaction(transaction -> {
                double currentBalance = accountRepository.getBalance(transaction, userId)
                        .orElseThrow(() -> new AccountNotFoundException("Withdrawal failed: Account not found in database."));

                if (currentBalance < amount) {
                    throw new InsufficientBalanceException("Withdrawal failed: Insufficient funds. Available balance: $" + currentBalance);
                }

                double newBalance = currentBalance - amount;

                // Update checking account balance
                accountRepository.updateBalance(transaction, userId, newBalance);

                // Log audit ledger record
                txnIdHolder[0] = transactionRepository.save(transaction, userId, TYPE_DEBIT, amount, desc, newBalance);
                return newBalance;
            }).get();

            return TransactionResponseDTO.builder()
                    .id(txnIdHolder[0])
                    .type(TYPE_DEBIT)
                    .amount(amount)
                    .description(desc)
                    .createdAt(LocalDateTime.now())
                    .postTransactionBalance(postBalance)
                    .build();

        } catch (AtmException e) {
            throw e;
        } catch (Exception e) {
            if (e instanceof InterruptedException || e.getCause() instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            logger.error("Withdrawal transaction failed in Firestore: {}", e.getMessage(), e);
            throw new AtmException("Transaction failure during cash withdrawal: " + e.getMessage());
        }
    }

    @Override
    public List<TransactionResponseDTO> getTransactions(String userId, String type, String sortBy, String direction, Integer page, Integer size) {
        return transactionRepository.findByUserId(userId, type, sortBy, direction, page, size);
    }

    @Override
    public void ensureAccountExists(String userId) {
        accountRepository.ensureExists(userId);
    }
}
