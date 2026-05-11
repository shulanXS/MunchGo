package com.cwj.munchgobackend.service.interfaces;

import com.cwj.munchgobackend.model.dto.request.CreateOrderRequest;
import com.cwj.munchgobackend.model.dto.request.OrderStatusRequest;
import com.cwj.munchgobackend.model.dto.response.OrderResponse;
import com.cwj.munchgobackend.model.dto.response.PageResponse;
import com.cwj.munchgobackend.model.enums.OrderStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {

    OrderResponse create(Long userId, CreateOrderRequest request);

    OrderResponse getById(Long id, Long userId, String userRole);

    PageResponse<OrderResponse> getByUserId(Long userId, Pageable pageable);

    PageResponse<OrderResponse> getByRestaurantId(Long restaurantId, Pageable pageable);

    PageResponse<OrderResponse> getByRiderId(Long riderId, Pageable pageable);

    PageResponse<OrderResponse> getByRestaurantIds(List<Long> restaurantIds, Pageable pageable);

    OrderResponse updateStatus(Long id, OrderStatus newStatus, Long userId, String userRole);

    OrderResponse cancel(Long id, Long userId);

    void delete(Long id, Long userId);
}
