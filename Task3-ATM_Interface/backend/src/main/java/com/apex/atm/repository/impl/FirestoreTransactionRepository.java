package com.apex.atm.repository.impl;

import com.apex.atm.dto.TransactionResponseDTO;
import com.apex.atm.exception.FirestoreException;
import com.apex.atm.repository.TransactionRepository;
import com.apex.atm.service.FirestoreService;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
@SuppressWarnings("null")
public class FirestoreTransactionRepository implements TransactionRepository {

    private static final Logger logger = LoggerFactory.getLogger(FirestoreTransactionRepository.class);

    private static final String FIELD_AMOUNT = "amount";
    private static final String FIELD_DESCRIPTION = "description";
    private static final String FIELD_CREATED_AT = "createdAt";
    private static final String FIELD_USER_ID = "userId";
    private static final String FIELD_TYPE = "type";
    private static final String FIELD_TRANSACTION_ID = "transactionId";
    private static final String FIELD_BALANCE_AFTER_TRANSACTION = "balanceAfterTransaction";
    private static final String COLLECTION_TRANSACTIONS = "transactions";
    private static final String TYPE_DEBIT = "debit";

    private final FirestoreService firestoreService;

    @Autowired
    public FirestoreTransactionRepository(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @Override
    public String save(Transaction txn, String userId, String type, double amount, String description, double balanceAfterTransaction) {
        try {
            Firestore db = firestoreService.getDb();
            DocumentReference docRef = db.collection(COLLECTION_TRANSACTIONS).document();
            String id = docRef.getId();
            txn.set(docRef, Map.of(
                    FIELD_TRANSACTION_ID, id,
                    FIELD_USER_ID, userId,
                    FIELD_TYPE, type,
                    FIELD_AMOUNT, amount,
                    FIELD_DESCRIPTION, description,
                    FIELD_BALANCE_AFTER_TRANSACTION, balanceAfterTransaction,
                    FIELD_CREATED_AT, FieldValue.serverTimestamp()
            ));
            return id;
        } catch (Exception e) {
            logger.error("Error logging transaction in DB transaction for user: {}", userId, e);
            throw new FirestoreException("Unable to write transaction log inside transaction: " + e.getMessage());
        }
    }

    @Override
    public TransactionResponseDTO save(String userId, String type, double amount, String description, double balanceAfterTransaction) {
        try {
            Firestore db = firestoreService.getDb();
            DocumentReference docRef = db.collection(COLLECTION_TRANSACTIONS).document();
            String id = docRef.getId();

            Map<String, Object> data = new HashMap<>();
            data.put(FIELD_TRANSACTION_ID, id);
            data.put(FIELD_USER_ID, userId);
            data.put(FIELD_TYPE, type);
            data.put(FIELD_AMOUNT, amount);
            data.put(FIELD_DESCRIPTION, description);
            data.put(FIELD_BALANCE_AFTER_TRANSACTION, balanceAfterTransaction);
            data.put(FIELD_CREATED_AT, FieldValue.serverTimestamp());

            docRef.set(data).get();
            return TransactionResponseDTO.builder()
                    .id(id)
                    .transactionId(id)
                    .type(type)
                    .amount(amount)
                    .description(description)
                    .createdAt(LocalDateTime.now())
                    .postTransactionBalance(balanceAfterTransaction)
                    .build();
        } catch (Exception e) {
            if (e instanceof InterruptedException || e.getCause() instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            logger.error("Failed to write transaction document: {}", e.getMessage(), e);
            throw new FirestoreException("Unable to log transaction: " + e.getMessage());
        }
    }

    @Override
    public List<TransactionResponseDTO> findByUserId(String userId, String type, String sortBy, String direction, Integer page, Integer size) {
        try {
            Firestore db = firestoreService.getDb();
            // Query only by userId (single-field index, no composite index needed)
            Query q = db.collection(COLLECTION_TRANSACTIONS)
                    .whereEqualTo(FIELD_USER_ID, userId);

            QuerySnapshot querySnapshot = q.get().get();
            List<TransactionResponseDTO> allTxns = new ArrayList<>();
            for (QueryDocumentSnapshot doc : querySnapshot.getDocuments()) {
                allTxns.add(mapToTransactionResponseDTO(doc));
            }

            List<TransactionResponseDTO> filtered = filterTransactions(allTxns, type);
            sortTransactions(filtered, getSortField(sortBy), "ASC".equalsIgnoreCase(direction));
            return paginateTransactions(filtered, page, size);

        } catch (Exception e) {
            if (e instanceof InterruptedException || e.getCause() instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            logger.error("Error retrieving transactions from Firestore: {}", e.getMessage(), e);
            throw new FirestoreException("Unable to retrieve transaction ledger: " + e.getMessage());
        }
    }

    private List<TransactionResponseDTO> filterTransactions(List<TransactionResponseDTO> allTxns, String type) {
        List<TransactionResponseDTO> filtered = new ArrayList<>();
        for (TransactionResponseDTO txn : allTxns) {
            if (type == null || type.trim().isEmpty() || "all".equalsIgnoreCase(type) ||
                    type.equalsIgnoreCase(txn.getType())) {
                filtered.add(txn);
            }
        }
        return filtered;
    }

    private void sortTransactions(List<TransactionResponseDTO> filtered, String sortField, boolean isAscending) {
        java.util.Comparator<TransactionResponseDTO> comparator;

        switch (sortField) {
            case FIELD_AMOUNT:
                comparator = java.util.Comparator.comparingDouble(TransactionResponseDTO::getAmount);
                break;
            case FIELD_TYPE:
                comparator = java.util.Comparator.comparing(
                        TransactionResponseDTO::getType,
                        java.util.Comparator.nullsFirst(String::compareToIgnoreCase)
                );
                break;
            case FIELD_DESCRIPTION:
                comparator = java.util.Comparator.comparing(
                        txn -> java.util.Objects.requireNonNullElse(txn.getDescription(), ""),
                        String::compareToIgnoreCase
                );
                break;
            case FIELD_CREATED_AT:
            default:
                comparator = java.util.Comparator.comparing(
                        txn -> java.util.Objects.requireNonNullElse(txn.getCreatedAt(), LocalDateTime.MIN)
                );
                break;
        }

        if (!isAscending) {
            comparator = comparator.reversed();
        }
        filtered.sort(comparator);
    }

    private List<TransactionResponseDTO> paginateTransactions(List<TransactionResponseDTO> sorted, Integer page, Integer size) {
        int limitVal = (size != null && size > 0) ? size : 10;
        int offset = (page != null && page > 0) ? page * limitVal : 0;

        if (offset >= sorted.size()) {
            return new ArrayList<>();
        }
        int end = Math.min(offset + limitVal, sorted.size());
        return sorted.subList(offset, end);
    }

    @Override
    public double getTodayWithdrawnAmount(String userId) {
        try {
            Firestore db = firestoreService.getDb();
            // Query only by userId to avoid requiring a composite index on (userId, type, createdAt)
            Query limitQuery = db.collection(COLLECTION_TRANSACTIONS)
                    .whereEqualTo(FIELD_USER_ID, userId);

            QuerySnapshot qSnap = limitQuery.get().get();
            Date dayAgo = Date.from(LocalDateTime.now().minusHours(24).atZone(ZoneId.systemDefault()).toInstant());
            double todayWithdrawn = 0.0;

            for (QueryDocumentSnapshot doc : qSnap.getDocuments()) {
                String tType = doc.getString(FIELD_TYPE);
                Date date = doc.getDate(FIELD_CREATED_AT);
                if (TYPE_DEBIT.equalsIgnoreCase(tType) && date != null && date.after(dayAgo)) {
                    Double amt = doc.getDouble(FIELD_AMOUNT);
                    if (amt != null) {
                        todayWithdrawn += amt;
                    }
                }
            }
            return todayWithdrawn;
        } catch (Exception e) {
            if (e instanceof InterruptedException || e.getCause() instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            logger.error("Error querying 24h withdrawal velocity for user: {}", userId, e);
            throw new FirestoreException("Unable to check daily ATM limits: " + e.getMessage());
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
        Double postBal = doc.getDouble(FIELD_BALANCE_AFTER_TRANSACTION);
        String id = doc.getId();
        String storedTxnId = doc.getString(FIELD_TRANSACTION_ID);
        return TransactionResponseDTO.builder()
                .id(id)
                .transactionId(storedTxnId != null ? storedTxnId : id)
                .type(doc.getString(FIELD_TYPE))
                .amount(amt != null ? amt : 0.0)
                .description(doc.getString(FIELD_DESCRIPTION))
                .createdAt(ldt)
                .postTransactionBalance(postBal != null ? postBal : 0.0)
                .build();
    }
}
