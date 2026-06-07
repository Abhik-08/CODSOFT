package com.apex.atm.service;

import com.apex.atm.dto.ChatResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private final AIAdvisorService aiAdvisorService;

    @Autowired
    public ChatService(AIAdvisorService aiAdvisorService) {
        this.aiAdvisorService = aiAdvisorService;
    }

    public ChatResponse chat(String userId, String userMessage) {
        return aiAdvisorService.generateAdvisorResponse(userId, userMessage);
    }
}
