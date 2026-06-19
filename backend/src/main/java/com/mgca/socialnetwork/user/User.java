package com.mgca.socialnetwork.user;

import com.mgca.socialnetwork.common.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a user in the MGCA corporate social network.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
@CompoundIndexes({
        @CompoundIndex(name = "idx_createdAt_active", def = "{'createdAt': -1, 'active': 1}")
})
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private String fullName;

    @Indexed
    @Builder.Default
    private Role role = Role.USER;

    private String jobTitle;

    @Indexed
    private String department;

    private String bio;

    private String avatarUrl;

    @Builder.Default
    private List<String> skills = new ArrayList<>();

    private String location;

    private String customSections;

    @Indexed
    @Builder.Default
    private boolean active = true;

    @CreatedDate
    @Indexed
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
