package com.apex.atm.repository;

import com.google.cloud.firestore.Transaction;
import java.util.Optional;

public interface AccountRepository {
    Optional<Double> getBalance(String userId);
    Optional<Double> getBalance(Transaction txn, String userId);
    void updateBalance(Transaction txn, String userId, double newBalance);
    void ensureExists(String userId);
}
