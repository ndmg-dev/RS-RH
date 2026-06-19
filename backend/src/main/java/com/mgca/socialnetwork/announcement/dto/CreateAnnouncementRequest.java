package com.mgca.socialnetwork.announcement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateAnnouncementRequest {

    @NotBlank(message = "O título é obrigatório.")
    @Size(min = 3, max = 100, message = "O título deve ter entre 3 e 100 caracteres.")
    private String title;

    @NotBlank(message = "O conteúdo é obrigatório.")
    @Size(min = 5, max = 500, message = "O conteúdo deve ter entre 5 e 500 caracteres.")
    private String content;

    @NotBlank(message = "O tipo do aviso é obrigatório.")
    @Pattern(regexp = "EVENT|DOCUMENT|GENERAL", message = "O tipo do aviso deve ser EVENT, DOCUMENT ou GENERAL.")
    private String type;
}
