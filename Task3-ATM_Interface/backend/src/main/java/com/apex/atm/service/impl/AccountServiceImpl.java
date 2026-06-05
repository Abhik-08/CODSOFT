package com.apex.atm.service.impl;

import com.apex.atm.dto.BalanceResponseDTO;
import com.apex.atm.dto.TransactionResponseDTO;
import com.apex.atm.exception.DailyLimitExceededException;
import com.apex.atm.exception.InsufficientBalanceException;
import com.apex.atm.exception.AccountNotFoundException;
import com.apex.atm.exception.InvalidAmountException;
import com.apex.atm.exception.AtmException;
import com.apex.atm.service.AccountService;
import com.google.api.core.ApiFuture;
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
public class AccountServiceImpl implements AccountService {

    private static final Logger logger = LoggerFactory.getLogger(AccountServiceImpl.class);
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
    private static final String FIELD_UPDATED_AT = "updatedAt";

    // Transaction Types
    private static final String TYPE_CREDIT = "credit";
    private static final String TYPE_DEBIT = "debit";

    // Thread-safe in-memory stores for local development Mock Mode
    private static final Map<String, Double> mockBalances = new ConcurrentHashMap<>();
    private static final Map<String, LocalDateTime> mockUpdateTimes = new ConcurrentHashMap<>();
    private static final Map<String, List<TransactionResponseDTO>> mockTransactions = new ConcurrentHashMap<>();

    @Override
    public BalanceResponseDTO getBalance(String userId) {
        if (FirebaseApp.getApps().isEmpty()) {
            logger.info("[Mock] Retrieving local memory balance for user: {}", userId);
            ensureAccountExists(userId);
            return BalanceResponseDTO.builder()
                    .userId(userId)
                    .balance(mockBalances.get(userId))
                    .lastUpdatedAt(mockUpdateTimes.get(userId))
                    .build();
        }

        try {
            Firestore db = FirestoreClient.getFirestore();
            DocumentReference accountRef = db.collection(COLLECTION_ACCOUNTS).document(userId);
            ApiFuture<DocumentSnapshot> future = accountRef.get();
            DocumentSnapshot document = future.get();

            if (!document.exists()) {
                ensureAccountExists(userId);
                return BalanceResponseDTO.builder()
                        .userId(userId)
                        .balance(0.0)
                        .lastUpdatedAt(LocalDateTime.now())
                        .build();
            }

            Double balance = document.getDouble(FIELD_BALANCE);
            Date updatedAt = document.getDate(FIELD_UPDATED_AT);
            LocalDateTime lastUpdated = updatedAt != null
                    ? LocalDateTime.ofInstant(updatedAt.toInstant(), ZoneId.systemDefault())
                    : LocalDateTime.now();

            return BalanceResponseDTO.builder()
                    .userId(userId)
                    .balance(balance != null ? balance : 0.0)
                    .lastUpdatedAt(lastUpdated)
                    .build();

        } catch (Exception e) {
            logger.error("Error retrieving balance from Firestore: {}", e.getMessage());
            throw new AccountNotFoundException("Unable to retrieve checking account: " + e.getMessage());
        }
    }

    @Override
    public TransactionResponseDTO deposit(String userId, double amount, String description) {
        if (amount <= 0) {
            throw new InvalidAmountException("Deposit amount must be greater than zero");
        }
        ensureAccountExists(userId);

        String desc = description != null ? description : "Cash Deposit";

        if (FirebaseApp.getApps().isEmpty()) {
            logger.info("[Mock] Executing local memory deposit for user: {}", userId);
            double currentBalance = mockBalances.get(userId);
            double newBalance = currentBalance + amount;
            mockBalances.put(userId, newBalance);
            mockUpdateTimes.put(userId, LocalDateTime.now());

            TransactionResponseDTO txn = TransactionResponseDTO.builder()
                    .id("mock-txn-" + UUID.randomUUID().toString().substring(0, 8))
                    .type(TYPE_CREDIT)
                    .amount(amount)
                    .description(desc)
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
                double newBalance = currentBalance + amount;

                // Update checking account balance
                transaction.update(accountRef, Map.of(
                        FIELD_BALANCE, newBalance,
                        FIELD_UPDATED_AT, FieldValue.serverTimestamp()
                ));

                // Log audit ledger record
                Map<String, Object> txnData = new HashMap<>();
                txnData.put(FIELD_USER_ID, userId);
                txnData.put(FIELD_TYPE, TYPE_CREDIT);
                txnData.put(FIELD_AMOUNT, amount);
                txnData.put(FIELD_DESCRIPTION, desc);
                txnData.put(FIELD_CREATED_AT, FieldValue.serverTimestamp());

                transaction.set(txnRef, txnData);
                return newBalance;
            }).get();

            return TransactionResponseDTO.builder()
                    .id(txnId)
                    .type(TYPE_CREDIT)
                    .amount(amount)
                    .description(desc)
                    .createdAt(LocalDateTime.now())
                    .postTransactionBalance(postBalance)
                    .build();

        } catch (Exception e) {
            logger.error("Deposit transaction failed in Firestore: {}", e.getMessage());
            throw new AccountNotFoundException("Transaction failure during cash deposit: " + e.getMessage());
        }
    }

    @Override
    public TransactionResponseDTO withdraw(String userId, double amount, String description) {
        if (amount <= 0) {
            throw new InvalidAmountException("Withdrawal amount must be greater than zero");
        }
        ensureAccountExists(userId);

        String desc = description != null ? description : "Cash Withdrawal";

        if (FirebaseApp.getApps().isEmpty()) {
            logger.info("[Mock] Executing local memory withdrawal for user: {}", userId);
            double currentBalance = mockBalances.get(userId);

            if (currentBalance < amount) {
                throw new InsufficientBalanceException("Withdrawal failed: Insufficient funds. Available: $" + currentBalance);
            }

            double todayWithdrawn = getTodayWithdrawnAmountMock(userId);
            if (todayWithdrawn + amount > DAILY_WITHDRAWAL_LIMIT) {
                throw new DailyLimitExceededException("Withdrawal failed: Exceeds daily ATM limit of $" 
                        + DAILY_WITHDRAWAL_LIMIT + ". Already withdrawn in last 24h: $" + todayWithdrawn);
            }

            double newBalance = currentBalance - amount;
            mockBalances.put(userId, newBalance);
            mockUpdateTimes.put(userId, LocalDateTime.now());

            TransactionResponseDTO txn = TransactionResponseDTO.builder()
                    .id("mock-txn-" + UUID.randomUUID().toString().substring(0, 8))
                    .type(TYPE_DEBIT)
                    .amount(amount)
                    .description(desc)
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
            if (todayWithdrawn + amount > DAILY_WITHDRAWAL_LIMIT) {
                throw new DailyLimitExceededException("Withdrawal failed: Exceeds daily ATM limit of $" 
                        + DAILY_WITHDRAWAL_LIMIT + ". Already withdrawn in last 24h: $" + todayWithdrawn);
            }

            String txnId = txnRef.getId();
            double postBalance = db.runTransaction(transaction -> {
                DocumentSnapshot accountSnap = transaction.get(accountRef).get();
                double currentBalance = getAccountBalanceValue(accountSnap);

                if (currentBalance < amount) {
                    throw new InsufficientBalanceException("Withdrawal failed: Insufficient funds. Available balance: $" + currentBalance);
                }

                double newBalance = currentBalance - amount;

                transaction.update(accountRef, Map.of(
                        FIELD_BALANCE, newBalance,
                        FIELD_UPDATED_AT, FieldValue.serverTimestamp()
                ));

                transaction.set(txnRef, Map.of(
                        FIELD_USER_ID, userId,
                        FIELD_TYPE, TYPE_DEBIT,
                        FIELD_AMOUNT, amount,
                        FIELD_DESCRIPTION, desc,
                        FIELD_CREATED_AT, FieldValue.serverTimestamp()
                ));
                return newBalance;
            }).get();

            return TransactionResponseDTO.builder()
                    .id(txnId)
                    .type(TYPE_DEBIT)
                    .amount(amount)
                    .description(desc)
                    .createdAt(LocalDateTime.now())
                    .postTransactionBalance(postBalance)
                    .build();

        } catch (AtmException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Withdrawal transaction failed in Firestore: {}", e.getMessage());
            throw new AccountNotFoundException("Transaction failure during cash withdrawal: " + e.getMessage());
        }
    }

    @Override
    public List<TransactionResponseDTO> getTransactions(String userId, String type, String sortBy, String direction, Integer page, Integer size) {
        if (FirebaseApp.getApps().isEmpty()) {
            return getMockTransactions(userId, type, sortBy, direction, page, size);
        }
        return getFirestoreTransactions(userId, type, sortBy, direction, page, size);
    }

    private List<TransactionResponseDTO> getMockTransactions(String userId, String type, String sortBy, String direction, Integer page, Integer size) {
        logger.info("[Mock] Retrieving local memory transactions for user: {}, type: {}, sortBy: {}, direction: {}, page: {}, size: {}", 
                userId, type, sortBy, direction, page, size);
        List<TransactionResponseDTO> txns = mockTransactions.getOrDefault(userId, List.of());

        // Filtering by type
        if (type != null && !type.trim().isEmpty() && !"all".equalsIgnoreCase(type)) {
            String targetType = type.toLowerCase();
            txns = txns.stream()
                    .filter(t -> targetType.equals(t.getType()))
                    .toList();
        }

        // Sorting
        boolean ascending = "ASC".equalsIgnoreCase(direction);
        List<TransactionResponseDTO> sortedTxns = new ArrayList<>(txns);
        sortedTxns.sort((t1, t2) -> {
            int comp;
            if (FIELD_AMOUNT.equalsIgnoreCase(sortBy)) {
                comp = Double.compare(t1.getAmount(), t2.getAmount());
            } else if ("id".equalsIgnoreCase(sortBy)) {
                comp = t1.getId().compareTo(t2.getId());
            } else {
                comp = t1.getCreatedAt().compareTo(t2.getCreatedAt());
            }
            return ascending ? comp : -comp;
        });

        // Pagination
        int limitVal = (size != null && size > 0) ? size : 10;
        int startOffset = (page != null && page > 0) ? page * limitVal : 0;

        if (startOffset >= sortedTxns.size()) {
            return List.of();
        }

        int endOffset = Math.min(startOffset + limitVal, sortedTxns.size());
        return sortedTxns.subList(startOffset, endOffset);
    }

    private List<TransactionResponseDTO> getFirestoreTransactions(String userId, String type, String sortBy, String direction, Integer page, Integer size) {
        try {
            Firestore db = FirestoreClient.getFirestore();
            Query q = db.collection(COLLECTION_TRANSACTIONS)
                    .whereEqualTo(FIELD_USER_ID, userId);

            // Filtering by type
            if (type != null && !type.trim().isEmpty() && !"all".equalsIgnoreCase(type)) {
                q = q.whereEqualTo(FIELD_TYPE, type.toLowerCase());
            }

            // Sorting
            String sortField = getSortField(sortBy);
            Query.Direction dir = "ASC".equalsIgnoreCase(direction) ? Query.Direction.ASCENDING : Query.Direction.DESCENDING;
            q = q.orderBy(sortField, dir);

            // Pagination
            int limitVal = (size != null && size > 0) ? size : 10;
            q = q.limit(limitVal);

            if (page != null && page > 0) {
                q = q.offset(page * limitVal);
            }

            QuerySnapshot querySnapshot = q.get().get();
            List<TransactionResponseDTO> results = new ArrayList<>();
            for (QueryDocumentSnapshot doc : querySnapshot.getDocuments()) {
                results.add(mapToTransactionResponseDTO(doc));
            }
            return results;

        } catch (Exception e) {
            logger.error("Error retrieving transactions from Firestore: {}", e.getMessage());
            throw new AccountNotFoundException("Unable to retrieve transaction ledger: " + e.getMessage());
        }
    }

    private String getSortField(String sortBy) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            return FIELD_CREATED_AT;
        }
        if (FIELD_CREATED_AT.equals(sortBy) || FIELD_AMOUNT.equals(sortBy) || 
                FIELD_TYPE.equals(sortBy) || FIELD_DESCRIPTION.equals(sortBy)) {
            return sortBy;
        }
        return FIELD_CREATED_AT;
    }

    private TransactionResponseDTO mapToTransactionResponseDTO(QueryDocumentSnapshot doc) {
        Date date = doc.getDate(FIELD_CREATED_AT);
        LocalDateTime ldt = date != null 
                ? LocalDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault()) 
                : LocalDateTime.now();

        Double amt = doc.getDouble(FIELD_AMOUNT);
        return TransactionResponseDTO.builder()
                .id(doc.getId())
                .type(doc.getString(FIELD_TYPE))
                .amount(amt != null ? amt : 0.0)
                .description(doc.getString(FIELD_DESCRIPTION))
                .createdAt(ldt)
                .postTransactionBalance(0.0)
                .build();
    }

    @Override
    public void ensureAccountExists(String userId) {
        if (FirebaseApp.getApps().isEmpty()) {
            if (!mockBalances.containsKey(userId)) {
                logger.info("[Mock] Initializing check account document for user {}", userId);
                mockBalances.put(userId, 0.0);
                mockUpdateTimes.put(userId, LocalDateTime.now());
            }
            return;
        }

        try {
            Firestore db = FirestoreClient.getFirestore();
            DocumentReference accountRef = db.collection(COLLECTION_ACCOUNTS).document(userId);
            ApiFuture<DocumentSnapshot> future = accountRef.get();
            DocumentSnapshot document = future.get();

            if (!document.exists()) {
                logger.info("Initializing checking account for user {}", userId);
                DocumentReference docRef = db.collection(COLLECTION_ACCOUNTS).document(userId);
                docRef.set(Map.of(
                        FIELD_USER_ID, userId,
                        FIELD_BALANCE, 0.0,
                        FIELD_UPDATED_AT, com.google.cloud.firestore.FieldValue.serverTimestamp()
                )).get();
            }
        } catch (Exception e) {
            logger.error("Error in ensureAccountExists: {}", e.getMessage());
        }
    }

    private double getTodayWithdrawnAmountMock(String userId) {
        return mockTransactions.getOrDefault(userId, List.of()).stream()
                .filter(t -> TYPE_DEBIT.equals(t.getType()))
                .filter(t -> t.getCreatedAt().isAfter(LocalDateTime.now().minusHours(24)))
                .mapToDouble(TransactionResponseDTO::getAmount)
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
