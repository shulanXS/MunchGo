package com.cwj.munchgobackend.model.dto.response;

import com.cwj.munchgobackend.model.enums.RestaurantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantResponse {

    private Long id;

    private Long ownerId;

    private String ownerUsername;

    private String name;

    private String description;

    private String address;

    private String phone;

    private String cuisineType;

    private String imageUrl;

    private Double rating;

    private Integer reviewCount;

    private RestaurantStatus status;

    private BigDecimal minOrderAmount;

    private BigDecimal deliveryFee;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
