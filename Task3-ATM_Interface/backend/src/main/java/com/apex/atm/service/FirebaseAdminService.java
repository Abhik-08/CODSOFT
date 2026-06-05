package com.apex.atm.service;

import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;

public interface FirebaseAdminService {
    FirebaseToken verifyToken(String token) throws FirebaseAuthException;
}
