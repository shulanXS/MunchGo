package com.cwj.munchgobackend.controller;

import com.cwj.munchgobackend.model.dto.request.CategoryRequest;
import com.cwj.munchgobackend.model.dto.response.ApiResponse;
import com.cwj.munchgobackend.model.dto.response.CategoryResponse;
import com.cwj.munchgobackend.security.UserPrincipal;
import com.cwj.munchgobackend.service.interfaces.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/api/restaurants/{rid}/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getByRestaurantId(@PathVariable("rid") Long restaurantId) {
        List<CategoryResponse> response = categoryService.getByRestaurantId(restaurantId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/api/restaurants/{rid}/categories")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @PathVariable("rid") Long restaurantId,
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CategoryResponse response = categoryService.create(restaurantId, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Category created successfully", response));
    }

    @PutMapping("/api/categories/{id}")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        CategoryResponse response = categoryService.update(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", response));
    }

    @DeleteMapping("/api/categories/{id}")
    @PreAuthorize("hasRole('MERCHANT')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        categoryService.delete(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully"));
    }
}
