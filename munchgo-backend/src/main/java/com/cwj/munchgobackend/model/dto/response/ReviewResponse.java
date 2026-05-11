package com.cwj.munchgobackend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Long id;

    private Long userId;

    private String username;

    private String userAvatar;

    private Long restaurantId;

    private Long orderId;

    private Integer rating;

    private String content;

    private List<String> images;

    private String reply;

    private LocalDateTime repliedAt;

    private LocalDateTime createdAt;
}
