package com.cwj.munchgobackend.controller;

import com.cwj.munchgobackend.model.dto.request.ReviewReplyRequest;
import com.cwj.munchgobackend.model.dto.request.ReviewRequest;
import com.cwj.munchgobackend.model.dto.response.ApiResponse;
import com.cwj.munchgobackend.model.dto.response.PageResponse;
import com.cwj.munchgobackend.model.dto.response.ReviewResponse;
import com.cwj.munchgobackend.security.UserPrincipal;
import com.cwj.munchgobackend.service.interfaces.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/api/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ReviewResponse response = reviewService.create(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Review created successfully", response));
    }

    @GetMapping("/api/restaurants/{id}/reviews")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getByRestaurantId(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<ReviewResponse> response = reviewService.getByRestaurantId(id, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/api/reviews/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ReviewResponse response = reviewService.update(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Review updated successfully", response));
    }

    @DeleteMapping("/api/reviews/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        reviewService.delete(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully"));
    }

    @PutMapping("/api/reviews/{id}/reply")
    public ResponseEntity<ApiResponse<ReviewResponse>> reply(
            @PathVariable Long id,
            @Valid @RequestBody ReviewReplyRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ReviewResponse response = reviewService.reply(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Reply added successfully", response));
    }
}
