package com.mgca.socialnetwork.admin;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data MongoDB repository for {@link AuditLog} documents.
 */
@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {

    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<AuditLog> findByActorIdOrderByCreatedAtDesc(String actorId, Pageable pageable);
}
