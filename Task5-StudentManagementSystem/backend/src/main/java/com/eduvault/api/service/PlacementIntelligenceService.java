package com.eduvault.api.service;

import com.eduvault.api.dto.PlacementIntelligenceDto;

public interface PlacementIntelligenceService {
    PlacementIntelligenceDto getPlacementIntelligence(String studentId);
    PlacementIntelligenceDto recalculate(String studentId);
}
