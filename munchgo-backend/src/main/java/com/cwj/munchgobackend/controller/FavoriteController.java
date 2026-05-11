package com.cwj.munchgobackend.controller;

import com.cwj.munchgobackend.model.dto.request.FavoriteRequest;
import com.cwj.munchgobackend.model.dto.response.ApiResponse;
import com.cwj.munchgobackend.model.dto.response.FavoriteResponse;
import com.cwj.munchgobackend.security.UserPrincipal;
import com.cwj.munchgobackend.service.interfaces.FavoriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FavoriteResponse>>> getFavorites(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<FavoriteResponse> response = favoriteService.getByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FavoriteResponse>> add(
            @Valid @RequestBody FavoriteRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        FavoriteResponse response = favoriteService.add(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Added to favorites", response));
    }

    @DeleteMapping("/{restaurantId}")
    public ResponseEntity<ApiResponse<Void>> remove(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        favoriteService.remove(currentUser.getId(), restaurantId);
        return ResponseEntity.ok(ApiResponse.success("Removed from favorites"));
    }

    @GetMapping("/check/{restaurantId}")
    public ResponseEntity<ApiResponse<Boolean>> check(
            @PathVariable Long restaurantId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        boolean isFavorite = favoriteService.check(currentUser.getId(), restaurantId);
        return ResponseEntity.ok(ApiResponse.success(isFavorite));
    }
}
