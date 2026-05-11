package com.cwj.munchgobackend.controller;

import com.cwj.munchgobackend.exception.BusinessException;
import com.cwj.munchgobackend.exception.ErrorCode;
import com.cwj.munchgobackend.model.dto.request.CreateOrderRequest;
import com.cwj.munchgobackend.model.dto.request.OrderStatusRequest;
import com.cwj.munchgobackend.model.dto.response.ApiResponse;
import com.cwj.munchgobackend.model.dto.response.OrderResponse;
import com.cwj.munchgobackend.model.dto.response.PageResponse;
import com.cwj.munchgobackend.model.entity.Restaurant;
import com.cwj.munchgobackend.model.enums.UserRole;
import com.cwj.munchgobackend.repository.RestaurantRepository;
import com.cwj.munchgobackend.security.UserPrincipal;
import com.cwj.munchgobackend.service.interfaces.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final RestaurantRepository restaurantRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> create(
            @Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        OrderResponse response = orderService.create(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Order created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        OrderResponse response = orderService.getById(id, currentUser.getId(), currentUser.getRole().name());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getStats() {
        Object stats = orderService.getStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('RIDER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAvailableOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<OrderResponse> response = orderService.getAvailableOrders(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('ADMIN', 'MERCHANT')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getRecent(
            @RequestParam(defaultValue = "10") int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        PageResponse<OrderResponse> page = orderService.getAll(pageable);
        return ResponseEntity.ok(ApiResponse.success(page.getContent()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getOrders(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        Pageable pageable = PageRequest.of(page, size);
        
        PageResponse<OrderResponse> response;
        String userRole = role != null ? role : currentUser.getRole().name();
        
        switch (userRole) {
            case "MERCHANT" -> {
                List<Restaurant> restaurants = restaurantRepository.findByUserId(currentUser.getId());
                if (restaurants.isEmpty()) {
                    response = PageResponse.<OrderResponse>builder()
                            .content(List.of())
                            .page(page)
                            .size(size)
                            .totalElements(0)
                            .totalPages(0)
                            .first(true)
                            .last(true)
                            .build();
                } else {
                    List<Long> restaurantIds = restaurants.stream()
                            .map(Restaurant::getId)
                            .collect(Collectors.toList());
                    response = orderService.getByRestaurantIds(restaurantIds, pageable);
                }
            }
            case "RIDER" -> response = orderService.getByRiderId(currentUser.getId(), pageable);
            case "ADMIN" -> response = orderService.getAll(pageable);
            default -> response = orderService.getByUserId(currentUser.getId(), pageable);
        }
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        OrderResponse response = orderService.updateStatus(
                id, request.getStatus(), currentUser.getId(), currentUser.getRole().name());
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", response));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        OrderResponse response = orderService.cancel(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        orderService.delete(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Order deleted successfully"));
    }
}
