package com.mgca.socialnetwork.admin.dto;

import com.mgca.socialnetwork.common.Role;
import lombok.Data;

@Data
public class AdminUserUpdateRequest {

    private Role role;

    private Boolean active;
}
