package com.eduvault.api.service;

import com.eduvault.api.dto.AnalyticsDto;
import java.util.Map;

public interface AnalyticsService {
    AnalyticsDto getOverview();
    Map<String, Object> getCgpaDistribution();
    Map<String, Object> getAttendanceAnalytics();
    Map<String, Object> getRiskAnalytics();
    Map<String, Object> getDepartmentAnalytics();
    Map<String, Object> getPlacementAnalytics();
}
