package com.apex.atm.service.impl;

import com.apex.atm.dto.DepositRequest;
import com.apex.atm.dto.TransactionResponse;
import com.apex.atm.dto.WithdrawRequest;
import com.apex.atm.exception.DailyLimitExceededException;
import com.apex.atm.exception.InsufficientFundsException;
import com.apex.atm.exception.ResourceNotFoundException;
import com.apex.atm.service.TransactionService;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.FirestoreClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class TransactionServiceImpl implements TransactionService {

    private static final Logger logger = LoggerFactory.getLogger(TransactionServiceImpl.class);
    private static final double DAILY_WITHDRAWAL_LIMIT = 2000.0;

    // Firestore Collection Names
    private static final String COLLECTION_ACCOUNTS = "accounts";
    private static final String COLLECTION_TRANSACTIONS = "transactions";

    // Firestore Document Fields
    private static final String FIELD_BALANCE = "balance";
    private static final String FIELD_USER_ID = "userId";
    private static final String FIELD_TYPE = "type";
    private static final String FIELD_AMOUNT = "amount";
    private static final String FIELD_DESCRIPTION = "description";
    private static final String FIELD_CREATED_AT = "createdAt";

    // Transaction Types
    private static final String TYPE_CREDIT = "credit";
    private static final String TYPE_DEBIT = "debit";

    // Thread-safe in-memory list for local development Mock Mode
    private static final Map<String, List<TransactionResponse>> mockTransactions = new ConcurrentHashMap<>();

    @Override
    public TransactionResponse deposit(String userId, DepositRequest request) {
        double depositAmount = request.getAmount();
        String description = request.getDescription() != null ? request.getDescription() : "Cash Deposit";

        if (FirebaseApp.getApps().isEmpty()) {
            logger.info("[Mock] Executing local memory deposit for user: {}", userId);
            double currentBalance = AccountServiceImpl.getMockBalanceValue(userId);
            double newBalance = currentBalance + depositAmount;
            AccountServiceImpl.updateMockBalance(userId, newBalance);

            TransactionResponse txn = TransactionResponse.builder()
                    .id("mock-txn-" + UUID.randomUUID().toString().substring(0, 8))
                    .type(TYPE_CREDIT)
                    .amount(depositAmount)
                    .description(description)
                    .createdAt(LocalDateTime.now())
                    .postTransactionBalance(newBalance)
                    .build();

            mockTransactions.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(0, txn);
            return txn;
        }

        try {
            Firestore db = FirestoreClient.getFirestore();
            DocumentReference accountRef = db.collection(COLLECTION_ACCOUNTS).document(userId);
            DocumentReference txnRef = db.collection(COLLECTION_TRANSACTIONS).document();

            String txnId = txnRef.getId();
            double postBalance = db.runTransaction(transaction -> {
                DocumentSnapshot accountSnap = transaction.get(accountRef).get();
                double currentBalance = getAccountBalanceValue(accountSnap);
                double newBalance = currentBalance + depositAmount;

                // Update checking account balance
                transaction.update(accountRef, Map.of(
                        FIELD_BALANCE, newBalance,
                        "updatedAt", FieldValue.serverTimestamp()
                ));

                // Log audit ledger record
                Map<String, Object> txnData = new HashMap<>();
                txnData.put(FIELD_USER_ID, userId);
                txnData.put(FIELD_TYPE, TYPE_CREDIT);
                txnData.put(FIELD_AMOUNT, depositAmount);
                txnData.put(FIELD_DESCRIPTION, description);
                txnData.put(FIELD_CREATED_AT, FieldValue.serverTimestamp());

                transaction.set(txnRef, txnData);
                return newBalance;
            }).get();

            return TransactionResponse.builder()
                    .id(txnId)
                    .type(TYPE_CREDIT)
                    .amount(depositAmount)
                    .description(description)
                    .createdAt(LocalDateTime.now())
                    .postTransactionBalance(postBalance)
                    .build();

        } catch (Exception e) {
            logger.error("Deposit transaction failed in Firestore: {}", e.getMessage());
            throw new ResourceNotFoundException("Transaction failure during cash deposit: " + e.getMessage());
        }
    }

    @Override
    public TransactionResponse withdraw(String userId, WithdrawRequest request) {
        double withdrawAmount = request.getAmount();
        String description = request.getDescription() != null ? request.getDescription() : "Cash Withdrawal";

        if (FirebaseApp.getApps().isEmpty()) {
            logger.info("[Mock] Executing local memory withdrawal for user: {}", userId);
            double currentBalance = AccountServiceImpl.getMockBalanceValue(userId);

            if (currentBalance < withdrawAmount) {
                throw new InsufficientFundsException("Withdrawal failed: Insufficient funds. Available: $" + currentBalance);
            }

            double todayWithdrawn = getTodayWithdrawnAmountMock(userId);
            if (todayWithdrawn + withdrawAmount > DAILY_WITHDRAWAL_LIMIT) {
                throw new DailyLimitExceededException("Withdrawal failed: Exceeds daily ATM limit of $" 
                        + DAILY_WITHDRAWAL_LIMIT + ". Already withdrawn in last 24h: $" + todayWithdrawn);
            }

            double newBalance = currentBalance - withdrawAmount;
            AccountServiceImpl.updateMockBalance(userId, newBalance);

            TransactionResponse txn = TransactionResponse.builder()
                    .id("mock-txn-" + UUID.randomUUID().toString().substring(0, 8))
                    .type(TYPE_DEBIT)
                    .amount(withdrawAmount)
                    .description(description)
                    .createdAt(LocalDateTime.now())
                    .postTransactionBalance(newBalance)
                    .build();

            mockTransactions.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(0, txn);
            return txn;
        }

        try {
            Firestore db = FirestoreClient.getFirestore();
            DocumentReference accountRef = db.collection(COLLECTION_ACCOUNTS).document(userId);
            DocumentReference txnRef = db.collection(COLLECTION_TRANSACTIONS).document();

            double todayWithdrawn = getTodayWithdrawnAmountReal(db, userId);
            if (todayWithdrawn + withdrawAmount > DAILY_WITHDRAWAL_LIMIT) {
                throw new DailyLimitExceededException("Withdrawal failed: Exceeds daily ATM limit of $" 
                        + DAILY_WITHDRAWAL_LIMIT + ". Already withdrawn in last 24h: $" + todayWithdrawn);
            }

            String txnId = txnRef.getId();
            double postBalance = db.runTransaction(transaction -> {
                DocumentSnapshot accountSnap = transaction.get(accountRef).get();
                double currentBalance = getAccountBalanceValue(accountSnap);

                if (currentBalance < withdrawAmount) {
                    throw new InsufficientFundsException("Withdrawal failed: Insufficient funds. Available balance: $" + currentBalance);
                }

                double newBalance = currentBalance - withdrawAmount;

                transaction.update(accountRef, Map.of(
                        FIELD_BALANCE, newBalance,
                        "updatedAt", FieldValue.serverTimestamp()
                ));

                transaction.set(txnRef, Map.of(
                        FIELD_USER_ID, userId,
                        FIELD_TYPE, TYPE_DEBIT,
                        FIELD_AMOUNT, withdrawAmount,
                        FIELD_DESCRIPTION, description,
                        FIELD_CREATED_AT, FieldValue.serverTimestamp()
                ));
                return newBalance;
            }).get();

            return TransactionResponse.builder()
                    .id(txnId)
                    .type(TYPE_DEBIT)
                    .amount(withdrawAmount)
                    .description(description)
                    .createdAt(LocalDateTime.now())
                    .postTransactionBalance(postBalance)
                    .build();

        } catch (AtmException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Withdrawal transaction failed in Firestore: {}", e.getMessage());
            throw new ResourceNotFoundException("Transaction failure during cash withdrawal: " + e.getMessage());
        }
    }

    @Override
    public List<TransactionResponse> getTransactions(String userId, Integer limit) {
        if (FirebaseApp.getApps().isEmpty()) {
            logger.info("[Mock] Retrieving local memory transactions for user: {}", userId);
            List<TransactionResponse> txns = mockTransactions.getOrDefault(userId, List.of());
            if (limit != null && limit < txns.size()) {
                return txns.subList(0, limit);
            }
            return txns;
        }

        try {
            Firestore db = FirestoreClient.getFirestore();
            Query q = db.collection(COLLECTION_TRANSACTIONS)
                    .whereEqualTo(FIELD_USER_ID, userId)
                    .orderBy(FIELD_CREATED_AT, Query.Direction.DESCENDING);

            if (limit != null) {
                q = q.limit(limit);
            }

            QuerySnapshot querySnapshot = q.get().get();
            List<TransactionResponse> results = new ArrayList<>();
            for (QueryDocumentSnapshot doc : querySnapshot.getDocuments()) {
                Date date = doc.getDate(FIELD_CREATED_AT);
                LocalDateTime ldt = date != null 
                        ? LocalDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault()) 
                        : LocalDateTime.now();

                Double amt = doc.getDouble(FIELD_AMOUNT);
                results.add(TransactionResponse.builder()
                        .id(doc.getId())
                        .type(doc.getString(FIELD_TYPE))
                        .amount(amt != null ? amt : 0.0)
                        .description(doc.getString(FIELD_DESCRIPTION))
                        .createdAt(ldt)
                        .postTransactionBalance(0.0)
                        .build());
            }
            return results;

        } catch (Exception e) {
            logger.error("Error retrieving transactions from Firestore: {}", e.getMessage());
            throw new ResourceNotFoundException("Unable to retrieve transaction ledger: " + e.getMessage());
        }
    }

    private double getTodayWithdrawnAmountMock(String userId) {
        return mockTransactions.getOrDefault(userId, List.of()).stream()
                .filter(t -> TYPE_DEBIT.equals(t.getType()))
                .filter(t -> t.getCreatedAt().isAfter(LocalDateTime.now().minusHours(24)))
                .mapToDouble(TransactionResponse::getAmount)
                .sum();
    }

    private double getTodayWithdrawnAmountReal(Firestore db, String userId) throws Exception {
        Date dayAgo = Date.from(LocalDateTime.now().minusHours(24).atZone(ZoneId.systemDefault()).toInstant());
        Query limitQuery = db.collection(COLLECTION_TRANSACTIONS)
                .whereEqualTo(FIELD_USER_ID, userId)
                .whereEqualTo(FIELD_TYPE, TYPE_DEBIT)
                .whereGreaterThanOrEqualTo(FIELD_CREATED_AT, dayAgo);

        QuerySnapshot qSnap = limitQuery.get().get();
        double todayWithdrawn = 0.0;
        for (QueryDocumentSnapshot doc : qSnap.getDocuments()) {
            Double amt = doc.getDouble(FIELD_AMOUNT);
            if (amt != null) {
                todayWithdrawn += amt;
            }
        }
        return todayWithdrawn;
    }

    private double getAccountBalanceValue(DocumentSnapshot accountSnap) {
        if (accountSnap.exists()) {
            Double b = accountSnap.getDouble(FIELD_BALANCE);
            if (b != null) {
                return b;
            }
        }
        return 0.0;
    }
}
