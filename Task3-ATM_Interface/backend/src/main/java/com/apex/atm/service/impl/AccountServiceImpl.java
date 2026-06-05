package com.apex.atm.service.impl;

import com.apex.atm.dto.BalanceResponseDTO;
import com.apex.atm.exception.ResourceNotFoundException;
import com.apex.atm.service.AccountService;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.FirestoreClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AccountServiceImpl implements AccountService {

    private static final Logger logger = LoggerFactory.getLogger(AccountServiceImpl.class);
    private static final String ACCOUNTS_COLLECTION = "accounts";

    // Thread-safe in-memory store for local development Mock Mode
    private static final Map<String, Double> mockBalances = new ConcurrentHashMap<>();
    private static final Map<String, LocalDateTime> mockUpdateTimes = new ConcurrentHashMap<>();

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
            DocumentReference accountRef = db.collection(ACCOUNTS_COLLECTION).document(userId);
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

            Double balance = document.getDouble("balance");
            Date updatedAt = document.getDate("updatedAt");
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
            throw new ResourceNotFoundException("Unable to retrieve checking account: " + e.getMessage());
        }
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
            DocumentReference accountRef = db.collection(ACCOUNTS_COLLECTION).document(userId);
            ApiFuture<DocumentSnapshot> future = accountRef.get();
            DocumentSnapshot document = future.get();

            if (!document.exists()) {
                logger.info("Initializing checking account for user {}", userId);
                DocumentReference docRef = db.collection(ACCOUNTS_COLLECTION).document(userId);
                docRef.set(Map.of(
                        "userId", userId,
                        "balance", 0.0,
                        "updatedAt", com.google.cloud.firestore.FieldValue.serverTimestamp()
                )).get();
            }
        } catch (Exception e) {
            logger.error("Error in ensureAccountExists: {}", e.getMessage());
        }
    }

    public static void updateMockBalance(String userId, double newBalance) {
        mockBalances.put(userId, newBalance);
        mockUpdateTimes.put(userId, LocalDateTime.now());
    }

    public static double getMockBalanceValue(String userId) {
        return mockBalances.getOrDefault(userId, 0.0);
    }
}
