package com.cwj.munchgobackend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteResponse {

    private Long id;

    private Long userId;

    private Long restaurantId;

    private String restaurantName;

    private String restaurantImage;

    private Double restaurantRating;

    private LocalDateTime createdAt;
}
