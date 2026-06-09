package com.eduvault.api.service;

import com.eduvault.api.dto.DashboardStatsDto;
import java.util.Map;

public interface AnalyticsService {
    DashboardStatsDto getDashboardStats();
    Map<String, Object> getCgpaAnalytics();
    Map<String, Object> getAttendanceAnalytics();
    Map<String, Long> getDepartmentAnalytics();
    Map<String, Object> getPlacementAnalytics();
}
