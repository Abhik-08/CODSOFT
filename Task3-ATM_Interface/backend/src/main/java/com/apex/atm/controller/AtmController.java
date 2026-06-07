package com.apex.atm.controller;

import com.apex.atm.dto.ApiErrorResponse;
import com.apex.atm.dto.ApiResponseDTO;
import com.apex.atm.dto.BalanceResponseDTO;
import com.apex.atm.dto.DepositRequestDTO;
import com.apex.atm.dto.TransactionResponseDTO;
import com.apex.atm.dto.WithdrawRequestDTO;
import com.apex.atm.dto.DailyLimitRequestDTO;
import com.apex.atm.exception.AtmException;
import com.apex.atm.exception.FirebaseAuthenticationException;
import com.apex.atm.service.AccountService;
import com.apex.atm.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/api/account")
@Tag(name = "ATM Checking Account Operations", description = "REST endpoints for managing ATM transactions (inquiry, deposit, withdrawal, history)")
public class AtmController {

    private static final Logger logger = LoggerFactory.getLogger(AtmController.class);
    private final AccountService accountService;

    @Autowired
    public AtmController(AccountService accountService) {
        this.accountService = accountService;
    }


    /**
     * Retrieves the checking account balance for the currently authenticated user.
     */

    @GetMapping("/balance")
    @Operation(summary = "Query Account Balance", description = "Retrieves the current balance details for the authenticated user session.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Account balance retrieved successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid Firebase authentication context",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Not Found - Checking account not found in database",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiErrorResponse.class)))
    })
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
    @Operation(summary = "Execute Cash Deposit", description = "Deposits the specified amount into the user's account and logs a transaction record.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Cash deposited successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request - Invalid format or non-positive amount",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid Firebase authentication context",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<ApiResponseDTO<TransactionResponseDTO>> deposit(@Valid @RequestBody DepositRequestDTO request) {
        String userId = getAuthenticatedUserId();
        // Log exact value with full precision to diagnose any future amount discrepancies
        logger.info("REST Request: Deposit amount={} (exact={}) for user {}", 
                request.getAmount(), String.format("%.10f", request.getAmount()), userId);
        TransactionResponseDTO response = accountService.deposit(userId, request.getAmount(), request.getDescription());
        logger.info("Deposit completed: stored amount={}, postBalance={} for user {}",
                response.getAmount(), response.getPostTransactionBalance(), userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.success(response, "Cash deposited successfully"));
    }

    /**
     * Executes a cash withdrawal transaction for the currently authenticated user.
     */
    @PostMapping("/withdraw")
    @Operation(summary = "Execute Cash Withdrawal", description = "Withdraws the specified amount from the checking account, verifying available funds and daily limits.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cash withdrawn successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request - Invalid format or non-positive amount",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid Firebase authentication context",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Unprocessable Entity - Insufficient funds or exceeds velocity limits",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<ApiResponseDTO<TransactionResponseDTO>> withdraw(@Valid @RequestBody WithdrawRequestDTO request) {
        String userId = getAuthenticatedUserId();
        logger.info("REST Request: Withdraw ${} for user {}", request.getAmount(), userId);
        TransactionResponseDTO response = accountService.withdraw(userId, request.getAmount(), request.getDescription());
        return ResponseEntity.ok(ApiResponseDTO.success(response, "Cash withdrawn successfully"));
    }

    /**
     * Updates the daily withdrawal limit for the currently authenticated user.
     */
    @PostMapping("/limit")
    @Operation(summary = "Update Daily ATM Limit", description = "Sets a personalized daily withdrawal limit for the authenticated user session.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Daily withdrawal limit updated successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request - Invalid format or non-positive limit",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid Firebase authentication context",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<ApiResponseDTO<Void>> updateDailyLimit(@Valid @RequestBody DailyLimitRequestDTO request) {
        String userId = getAuthenticatedUserId();
        logger.info("REST Request: Update daily limit to ${} for user {}", request.getLimit(), userId);
        accountService.updateDailyLimit(userId, request.getLimit());
        return ResponseEntity.ok(ApiResponseDTO.success(null, "Daily withdrawal limit updated successfully"));
    }

    /**
     * Retrieves the audit transaction ledger list for the currently authenticated user.
     */
    @GetMapping("/transactions")
    @Operation(summary = "Retrieve Transaction Ledger", description = "Queries transaction history records with pagination, sorting, and type-based filtering.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transaction ledger records retrieved successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request - Invalid pagination values or sorting directions",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid Firebase authentication context",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<ApiResponseDTO<List<TransactionResponseDTO>>> getTransactions(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "sortBy", required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "direction", required = false, defaultValue = "DESC") String direction,
            @RequestParam(value = "page", required = false, defaultValue = "0") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "10") Integer size) {
        String userId = getAuthenticatedUserId();
        logger.info("REST Request: Get transactions history for user {}, type={}, sortBy={}, direction={}, page={}, size={}", 
                userId, type, sortBy, direction, page, size);

        // Validation
        if (page != null && page < 0) {
            throw new AtmException("Page index cannot be negative");
        }
        if (size != null && size <= 0) {
            throw new AtmException("Page size must be greater than zero");
        }
        if (direction != null && !direction.equalsIgnoreCase("ASC") && !direction.equalsIgnoreCase("DESC")) {
            throw new AtmException("Invalid sort direction. Must be ASC or DESC");
        }

        List<TransactionResponseDTO> history = accountService.getTransactions(userId, type, sortBy, direction, page, size);
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
            throw new FirebaseAuthenticationException("Unauthorized session. Please login to complete this operation.");
        }
        return userId;
    }
}
