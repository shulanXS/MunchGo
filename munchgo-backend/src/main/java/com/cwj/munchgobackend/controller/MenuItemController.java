package com.cwj.munchgobackend.controller;

import com.cwj.munchgobackend.model.dto.request.MenuItemRequest;
import com.cwj.munchgobackend.model.dto.request.MenuItemStatusRequest;
import com.cwj.munchgobackend.model.dto.response.ApiResponse;
import com.cwj.munchgobackend.model.dto.response.MenuItemResponse;
import com.cwj.munchgobackend.model.dto.response.PageResponse;
import com.cwj.munchgobackend.security.UserPrincipal;
import com.cwj.munchgobackend.service.interfaces.MenuItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    @GetMapping("/api/restaurants/{rid}/menu-items")
    public ResponseEntity<ApiResponse<PageResponse<MenuItemResponse>>> getByRestaurantId(
            @PathVariable("rid") Long restaurantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<MenuItemResponse> response = menuItemService.getByRestaurantId(restaurantId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/menu-items/{id}")
    public ResponseEntity<ApiResponse<MenuItemResponse>> getById(@PathVariable Long id) {
        MenuItemResponse response = menuItemService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/restaurants/{rid}/menu-items")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> create(
            @PathVariable("rid") Long restaurantId,
            @Valid @RequestBody MenuItemRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        MenuItemResponse response = menuItemService.create(restaurantId, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Menu item created successfully", response));
    }

    @PutMapping("/api/menu-items/{id}")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        MenuItemResponse response = menuItemService.update(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Menu item updated successfully", response));
    }

    @PutMapping("/api/menu-items/{id}/available")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateAvailability(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemStatusRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        MenuItemResponse response = menuItemService.updateAvailability(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Menu item availability updated successfully", response));
    }

    @DeleteMapping("/api/menu-items/{id}")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        menuItemService.delete(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Menu item deleted successfully"));
    }
}
