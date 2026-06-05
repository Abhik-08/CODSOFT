package com.apex.atm.service;

import com.google.cloud.firestore.Firestore;

public interface FirestoreService {
    Firestore getDb();
    boolean isInitialized();
}
