package com.apex.atm.controller;

import com.apex.atm.dto.ChatRequest;
import com.apex.atm.dto.ChatResponse;
import com.apex.atm.exception.FirebaseAuthenticationException;
import com.apex.atm.service.ChatService;
import com.apex.atm.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String userId = SecurityUtil.getCurrentUserUid();
        if (userId == null) {
            throw new FirebaseAuthenticationException("Unauthorized session.");
        }
        return ResponseEntity.ok(chatService.chat(userId, request.getMessage()));
    }
}
