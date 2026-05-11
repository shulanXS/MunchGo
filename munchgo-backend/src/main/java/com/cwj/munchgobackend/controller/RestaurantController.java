package com.cwj.munchgobackend.controller;

import com.cwj.munchgobackend.model.dto.request.RestaurantRequest;
import com.cwj.munchgobackend.model.dto.request.RestaurantStatusRequest;
import com.cwj.munchgobackend.model.dto.response.ApiResponse;
import com.cwj.munchgobackend.model.dto.response.PageResponse;
import com.cwj.munchgobackend.model.dto.response.RestaurantResponse;
import com.cwj.munchgobackend.model.dto.response.RestaurantStatsResponse;
import com.cwj.munchgobackend.model.enums.RestaurantStatus;
import com.cwj.munchgobackend.security.UserPrincipal;
import com.cwj.munchgobackend.service.interfaces.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<RestaurantResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) RestaurantStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        PageResponse<RestaurantResponse> response = restaurantService.search(keyword, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RestaurantResponse>> getById(@PathVariable Long id) {
        RestaurantResponse response = restaurantService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<ApiResponse<RestaurantResponse>> create(
            @Valid @RequestBody RestaurantRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        RestaurantResponse response = restaurantService.create(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Restaurant created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<ApiResponse<RestaurantResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        RestaurantResponse response = restaurantService.update(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Restaurant updated successfully", response));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<ApiResponse<RestaurantResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantStatusRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        RestaurantResponse response = restaurantService.updateStatus(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Restaurant status updated successfully", response));
    }

    @GetMapping("/{id}/stats")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<ApiResponse<RestaurantStatsResponse>> getStats(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        RestaurantStatsResponse response = restaurantService.getStats(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        restaurantService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Restaurant deleted successfully"));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getMyRestaurants(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<RestaurantResponse> response = restaurantService.getByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
