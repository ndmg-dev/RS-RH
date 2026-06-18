package com.mgca.socialnetwork.admin;

import com.mgca.socialnetwork.common.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Records an administrative action in the audit trail.
     */
    public void log(String actorId, String action, String targetType,
                    String targetId, String details) {
        AuditLog entry = AuditLog.builder()
                .actorId(actorId)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
                .createdAt(Instant.now())
                .build();
        auditLogRepository.save(entry);
    }

    /**
     * Returns a paginated, reverse-chronological view of all audit log entries.
     */
    public PageResponse<AuditLog> getAuditLogs(Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.from(page);
    }
}
