package com.apex.atm.controller;

import com.apex.atm.dto.ApiResponseDTO;
import com.apex.atm.dto.BalanceResponseDTO;
import com.apex.atm.dto.DepositRequestDTO;
import com.apex.atm.dto.TransactionResponseDTO;
import com.apex.atm.dto.WithdrawRequestDTO;
import com.apex.atm.exception.AtmException;
import com.apex.atm.service.AccountService;
import com.apex.atm.service.TransactionService;
import com.apex.atm.util.SecurityUtil;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts")
public class AtmController {

    private static final Logger logger = LoggerFactory.getLogger(AtmController.class);

    private final AccountService accountService;
    private final TransactionService transactionService;

    @Autowired
    public AtmController(AccountService accountService, TransactionService transactionService) {
        this.accountService = accountService;
        this.transactionService = transactionService;
    }

    /**
     * Retrieves the checking account balance for the currently authenticated user.
     */
    @GetMapping("/balance")
    public ResponseEntity<ApiResponseDTO<BalanceResponseDTO>> getBalance() {
        String userId = getAuthenticatedUserId();
        logger.info("REST Request: Get balance for user {}", userId);
        BalanceResponseDTO response = accountService.getBalance(userId);
        return ResponseEntity.ok(ApiResponseDTO.success(response, "Balance retrieved successfully"));
    }

    /**
     * Executes a cash deposit transaction for the currently authenticated user.
     */
    @PostMapping("/deposit")
    public ResponseEntity<ApiResponseDTO<TransactionResponseDTO>> deposit(@Valid @RequestBody DepositRequestDTO request) {
        String userId = getAuthenticatedUserId();
        logger.info("REST Request: Deposit ${} for user {}", request.getAmount(), userId);
        TransactionResponseDTO response = transactionService.deposit(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.success(response, "Cash deposited successfully"));
    }

    /**
     * Executes a cash withdrawal transaction for the currently authenticated user.
     */
    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponseDTO<TransactionResponseDTO>> withdraw(@Valid @RequestBody WithdrawRequestDTO request) {
        String userId = getAuthenticatedUserId();
        logger.info("REST Request: Withdraw ${} for user {}", request.getAmount(), userId);
        TransactionResponseDTO response = transactionService.withdraw(userId, request);
        return ResponseEntity.ok(ApiResponseDTO.success(response, "Cash withdrawn successfully"));
    }

    /**
     * Retrieves the audit transaction ledger list for the currently authenticated user.
     */
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponseDTO<List<TransactionResponseDTO>>> getTransactions(
            @RequestParam(value = "limit", required = false) Integer limit) {
        String userId = getAuthenticatedUserId();
        logger.info("REST Request: Get transactions history for user {}, limit={}", userId, limit);
        List<TransactionResponseDTO> history = transactionService.getTransactions(userId, limit);
        return ResponseEntity.ok(ApiResponseDTO.success(history, "Transaction history retrieved successfully"));
    }

    /**
     * Helper method to retrieve the Firebase UID of the authenticated request.
     * Throws an unauthorized exception if principal details are missing.
     */
    private String getAuthenticatedUserId() {
        String userId = SecurityUtil.getCurrentUserUid();
        if (userId == null) {
            logger.warn("Attempted unauthorized access to account endpoints - Principal is empty.");
            throw new AtmException("Unauthorized session. Please login to complete this operation.", HttpStatus.UNAUTHORIZED);
        }
        return userId;
    }
}
