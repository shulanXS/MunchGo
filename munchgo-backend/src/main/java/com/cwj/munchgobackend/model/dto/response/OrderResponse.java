package com.cwj.munchgobackend.model.dto.response;

import com.cwj.munchgobackend.model.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;

    private String orderNo;

    private Long userId;

    private Long restaurantId;

    private String restaurantName;

    private Long riderId;

    private OrderStatus status;

    private BigDecimal totalAmount;

    private BigDecimal deliveryFee;

    private BigDecimal discountAmount;

    private BigDecimal finalAmount;

    private AddressResponse deliveryAddress;

    private String remark;

    private List<OrderItemResponse> items;

    private LocalDateTime paidAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
