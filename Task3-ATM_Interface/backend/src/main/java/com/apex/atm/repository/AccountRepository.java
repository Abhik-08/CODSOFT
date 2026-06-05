package com.apex.atm.repository;

import com.google.cloud.firestore.Transaction;
import java.util.Optional;

public interface AccountRepository {
    Optional<Double> getBalance(String userId);
    Optional<Double> getBalance(Transaction txn, String userId);
    void updateBalance(Transaction txn, String userId, double newBalance);
    Optional<Double> getDailyLimit(String userId);
    Optional<Double> getDailyLimit(Transaction txn, String userId);
    void updateDailyLimit(String userId, double limit);
    void ensureExists(String userId);
}
