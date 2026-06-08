package com.example.doantotnghiep.event;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class ActivityLogEvent {
    private Long projectId;
    private Long taskId;
    private String action;
    private Map<String, Object> details;

    // Lưu lại username của người đang request (vì khi chạy Async ngầm sẽ mất SecurityContext)
    private String actorUsername;
}