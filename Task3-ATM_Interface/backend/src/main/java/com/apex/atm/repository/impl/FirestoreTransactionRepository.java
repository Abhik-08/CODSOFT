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
            Query q = db.collection(COLLECTION_TRANSACTIONS)
                    .whereEqualTo(FIELD_USER_ID, userId);

            if (type != null && !type.trim().isEmpty() && !"all".equalsIgnoreCase(type)) {
                q = q.whereEqualTo(FIELD_TYPE, type.toLowerCase());
            }

            String sortField = getSortField(sortBy);
            Query.Direction dir = "ASC".equalsIgnoreCase(direction) ? Query.Direction.ASCENDING : Query.Direction.DESCENDING;
            q = q.orderBy(sortField, dir);

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
            if (e instanceof InterruptedException || e.getCause() instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            logger.error("Error retrieving transactions from Firestore: {}", e.getMessage(), e);
            throw new FirestoreException("Unable to retrieve transaction ledger: " + e.getMessage());
        }
    }

    @Override
    public double getTodayWithdrawnAmount(String userId) {
        try {
            Firestore db = firestoreService.getDb();
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
