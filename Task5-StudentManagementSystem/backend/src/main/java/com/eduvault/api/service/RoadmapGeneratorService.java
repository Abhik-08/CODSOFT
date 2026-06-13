package com.eduvault.api.service;

import com.eduvault.api.dto.RoadmapDto;

import java.util.List;

public interface RoadmapGeneratorService {
    List<RoadmapDto> getRoadmapsByStudentId(Long studentId);
    List<RoadmapDto> getAllRoadmaps();
    RoadmapDto generateRoadmap(Long studentId, String roadmapType);
    RoadmapDto updateRoadmap(Long id, RoadmapDto dto);
    void syncRoadmapsWithFirestore();
}
