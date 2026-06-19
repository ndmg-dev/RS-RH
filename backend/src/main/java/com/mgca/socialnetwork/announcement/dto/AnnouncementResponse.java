package com.mgca.socialnetwork.announcement.dto;

import com.mgca.socialnetwork.announcement.Announcement;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class AnnouncementResponse {

    private String id;
    private String title;
    private String content;
    private String type;
    private Instant createdAt;

    public static AnnouncementResponse from(Announcement announcement) {
        return AnnouncementResponse.builder()
                .id(announcement.getId())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .type(announcement.getType())
                .createdAt(announcement.getCreatedAt())
                .build();
    }
}
