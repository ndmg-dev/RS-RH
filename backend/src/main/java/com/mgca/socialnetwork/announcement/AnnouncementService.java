package com.mgca.socialnetwork.announcement;

import com.mgca.socialnetwork.announcement.dto.AnnouncementResponse;
import com.mgca.socialnetwork.announcement.dto.CreateAnnouncementRequest;
import com.mgca.socialnetwork.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public List<AnnouncementResponse> getAllAnnouncements() {
        return announcementRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(AnnouncementResponse::from)
                .collect(Collectors.toList());
    }

    public AnnouncementResponse createAnnouncement(CreateAnnouncementRequest request) {
        Announcement announcement = Announcement.builder()
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .type(request.getType())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        announcement = announcementRepository.save(announcement);
        return AnnouncementResponse.from(announcement);
    }

    public void deleteAnnouncement(String id) {
        if (!announcementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Announcement", "id", id);
        }
        announcementRepository.deleteById(id);
    }
}
