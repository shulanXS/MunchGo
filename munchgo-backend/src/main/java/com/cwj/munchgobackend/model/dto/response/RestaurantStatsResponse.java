package com.cwj.munchgobackend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantStatsResponse {

    private Long totalOrders;

    private Long todayOrders;

    private BigDecimal totalRevenue;

    private Double avgRating;
}
