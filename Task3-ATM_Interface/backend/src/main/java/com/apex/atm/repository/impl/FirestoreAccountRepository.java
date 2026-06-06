package com.apex.atm.repository.impl;

import com.apex.atm.exception.FirestoreException;
import com.apex.atm.repository.AccountRepository;
import com.apex.atm.service.FirestoreService;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Transaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;

@Repository
@SuppressWarnings("null")
public class FirestoreAccountRepository implements AccountRepository {

    private static final Logger logger = LoggerFactory.getLogger(FirestoreAccountRepository.class);
    private static final String COLLECTION_ACCOUNTS = "accounts";
    private static final String FIELD_BALANCE = "balance";
    private static final String FIELD_USER_ID = "userId";
    private static final String FIELD_UPDATED_AT = "updatedAt";
    private static final String FIELD_DAILY_LIMIT = "dailyLimit";

    private final FirestoreService firestoreService;

    @Autowired
    public FirestoreAccountRepository(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @Override
    public Optional<Double> getBalance(String userId) {
        try {
            Firestore db = firestoreService.getDb();
            DocumentReference accountRef = db.collection(COLLECTION_ACCOUNTS).document(userId);
            ApiFuture<DocumentSnapshot> future = accountRef.get();
            DocumentSnapshot document = future.get();

            if (document.exists()) {
                Double balance = document.getDouble(FIELD_BALANCE);
                return Optional.ofNullable(balance);
            }
            return Optional.empty();
        } catch (Exception e) {
            if (e instanceof InterruptedException || e.getCause() instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            logger.error("Error retrieving balance for user: {}", userId, e);
            throw new FirestoreException("Unable to read account balance: " + e.getMessage());
        }
    }

    @Override
    public Optional<Double> getBalance(Transaction txn, String userId) {
        try {
            Firestore db = firestoreService.getDb();
            DocumentReference accountRef = db.collection(COLLECTION_ACCOUNTS).document(userId);
            DocumentSnapshot document = txn.get(accountRef).get();

            if (document.exists()) {
                Double balance = document.getDouble(FIELD_BALANCE);
                return Optional.ofNullable(balance);
            }
            return Optional.empty();
        } catch (Exception e) {
            if (e instanceof InterruptedException || e.getCause() instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            logger.error("Error retrieving balance in transaction for user: {}", userId, e);
            throw new FirestoreException("Unable to read account balance inside transaction: " + e.getMessage());
        }
    }

    @Override
    public void updateBalance(Transaction txn, String userId, double newBalance) {
        try {
            Firestore db = firestoreService.getDb();
            DocumentReference accountRef = db.collection(COLLECTION_ACCOUNTS).document(userId);
            txn.set(accountRef, Map.of(
                    FIELD_USER_ID, userId,
                    FIELD_BALANCE, newBalance,
                    FIELD_UPDATED_AT, FieldValue.serverTimestamp()
            ), com.google.cloud.firestore.SetOptions.merge());
        } catch (Exception e) {
            logger.error("Error updating account balance for user: {}", userId, e);
            throw new FirestoreException("Unable to write account balance: " + e.getMessage());
        }
    }

    @Override
    public Optional<Double> getDailyLimit(String userId) {
        try {
            Firestore db = firestoreService.getDb();
            DocumentReference accountRef = db.collection(COLLECTION_ACCOUNTS).document(userId);
            ApiFuture<DocumentSnapshot> future = accountRef.get();
            DocumentSnapshot document = future.get();

            if (document.exists()) {
                Double limit = document.getDouble(FIELD_DAILY_LIMIT);
                return Optional.ofNullable(limit);
            }
            return Optional.empty();
        } catch (Exception e) {
            if (e instanceof InterruptedException || e.getCause() instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            logger.error("Error retrieving daily limit for user: {}", userId, e);
            throw new FirestoreException("Unable to read account daily limit: " + e.getMessage());
        }
    }

    @Override
    public Optional<Double> getDailyLimit(Transaction txn, String userId) {
        try {
            Firestore db = firestoreService.getDb();
            DocumentReference accountRef = db.collection(COLLECTION_ACCOUNTS).document(userId);
            DocumentSnapshot document = txn.get(accountRef).get();

            if (document.exists()) {
                Double limit = document.getDouble(FIELD_DAILY_LIMIT);
                return Optional.ofNullable(limit);
            }
            return Optional.empty();
        } catch (Exception e) {
            if (e instanceof InterruptedException || e.getCause() instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            logger.error("Error retrieving daily limit in transaction for user: {}", userId, e);
            throw new FirestoreException("Unable to read account daily limit inside transaction: " + e.getMessage());
        }
    }

    @Override
    public void updateDailyLimit(String userId, double limit) {
        try {
            Firestore db = firestoreService.getDb();
            DocumentReference accountRef = db.collection(COLLECTION_ACCOUNTS).document(userId);
            accountRef.set(Map.of(
                    FIELD_USER_ID, userId,
                    FIELD_DAILY_LIMIT, limit,
                    FIELD_UPDATED_AT, FieldValue.serverTimestamp()
            ), com.google.cloud.firestore.SetOptions.merge()).get();
        } catch (Exception e) {
            if (e instanceof InterruptedException || e.getCause() instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            logger.error("Error updating daily limit for user: {}", userId, e);
            throw new FirestoreException("Unable to write daily limit: " + e.getMessage());
        }
    }

    @Override
    public void ensureExists(String userId) {
        try {
            Firestore db = firestoreService.getDb();
            DocumentReference accountRef = db.collection(COLLECTION_ACCOUNTS).document(userId);
            ApiFuture<DocumentSnapshot> future = accountRef.get();
            DocumentSnapshot document = future.get();

            if (!document.exists()) {
                logger.info("Initializing checking account for user {}", userId);
                accountRef.set(Map.of(
                        FIELD_USER_ID, userId,
                        FIELD_BALANCE, 0.0,
                        FIELD_DAILY_LIMIT, 20000.0,
                        FIELD_UPDATED_AT, FieldValue.serverTimestamp()
                )).get();
            }
        } catch (Exception e) {
            if (e instanceof InterruptedException || e.getCause() instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            logger.error("Error in ensureExists: {}", e.getMessage(), e);
            throw new FirestoreException("Unable to initialize account: " + e.getMessage());
        }
    }
}
