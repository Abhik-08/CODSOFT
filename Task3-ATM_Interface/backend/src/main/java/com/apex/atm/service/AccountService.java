package com.apex.atm.service;

import com.apex.atm.dto.BalanceResponse;

public interface AccountService {
    BalanceResponse getBalance(String userId);
    void ensureAccountExists(String userId);
}
