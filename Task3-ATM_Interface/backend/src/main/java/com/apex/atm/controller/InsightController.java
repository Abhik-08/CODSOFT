package com.apex.atm.controller;

import com.apex.atm.dto.InsightResponse;
import com.apex.atm.exception.FirebaseAuthenticationException;
import com.apex.atm.service.InsightService;
import com.apex.atm.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class InsightController {

    private final InsightService insightService;

    @Autowired
    public InsightController(InsightService insightService) {
        this.insightService = insightService;
    }

    @GetMapping("/insights")
    public ResponseEntity<InsightResponse> getInsights() {
        String userId = SecurityUtil.getCurrentUserUid();
        if (userId == null) {
            throw new FirebaseAuthenticationException("Unauthorized session.");
        }
        return ResponseEntity.ok(insightService.generateInsights(userId));
    }
}
