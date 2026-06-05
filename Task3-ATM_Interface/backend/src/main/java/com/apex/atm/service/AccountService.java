package com.apex.atm.service;

import com.apex.atm.dto.BalanceResponseDTO;

public interface AccountService {
    BalanceResponseDTO getBalance(String userId);
    void ensureAccountExists(String userId);
}
