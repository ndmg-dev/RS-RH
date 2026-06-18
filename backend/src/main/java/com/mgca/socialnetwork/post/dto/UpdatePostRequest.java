package com.mgca.socialnetwork.post.dto;

import com.mgca.socialnetwork.common.Visibility;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdatePostRequest {

    @Size(max = 5000, message = "Post content must not exceed 5000 characters")
    private String content;

    private List<String> mediaUrls;

    private Visibility visibility;
}
