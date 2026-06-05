package com.apex.atm.service.impl;

import com.apex.atm.service.FirebaseAdminService;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class FirebaseAdminServiceImpl implements FirebaseAdminService {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseAdminServiceImpl.class);

    @Override
    public FirebaseToken verifyToken(String token) throws FirebaseAuthException {
        if (FirebaseApp.getApps().isEmpty()) {
            logger.error("Firebase Admin SDK is not initialized. Cannot verify real token.");
            throw new IllegalStateException("Firebase Admin SDK is not initialized.");
        }
        return FirebaseAuth.getInstance().verifyIdToken(token);
    }
}
