package com.mgca.socialnetwork.post.dto;

import com.mgca.socialnetwork.common.Visibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreatePostRequest {

    @NotBlank(message = "Post content is required")
    @Size(max = 5000, message = "Post content must not exceed 5000 characters")
    private String content;

    private List<String> mediaUrls;

    private Visibility visibility = Visibility.PUBLIC;
}
