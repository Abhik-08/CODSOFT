package com.apex.atm.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class SystemHealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> checkHealth() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "system", "APEX ATM Terminal API Server",
            "version", "0.0.1-SNAPSHOT"
        ));
    }
}
