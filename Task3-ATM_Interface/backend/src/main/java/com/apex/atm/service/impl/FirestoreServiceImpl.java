package com.apex.atm.service.impl;

import com.apex.atm.exception.FirestoreException;
import com.apex.atm.service.FirestoreService;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

@Service
public class FirestoreServiceImpl implements FirestoreService {

    @Override
    public Firestore getDb() {
        if (!isInitialized()) {
            throw new FirestoreException("Firebase Admin SDK is not initialized. Please configure valid Firebase credentials.");
        }
        return FirestoreClient.getFirestore();
    }

    @Override
    public boolean isInitialized() {
        return !FirebaseApp.getApps().isEmpty();
    }
}
