package com.mgca.socialnetwork.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Immutable audit log entry tracking administrative and moderation actions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    @Indexed
    private String actorId;

    @Indexed
    private String action;

    private String targetType;

    private String targetId;

    private String details;

    @CreatedDate
    @Indexed
    private Instant createdAt;
}
