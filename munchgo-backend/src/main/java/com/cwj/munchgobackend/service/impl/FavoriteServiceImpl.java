package com.cwj.munchgobackend.service.impl;

import com.cwj.munchgobackend.exception.BusinessException;
import com.cwj.munchgobackend.exception.ErrorCode;
import com.cwj.munchgobackend.model.dto.request.FavoriteRequest;
import com.cwj.munchgobackend.model.dto.response.FavoriteResponse;
import com.cwj.munchgobackend.model.entity.Favorite;
import com.cwj.munchgobackend.model.entity.Restaurant;
import com.cwj.munchgobackend.repository.FavoriteRepository;
import com.cwj.munchgobackend.repository.RestaurantRepository;
import com.cwj.munchgobackend.service.interfaces.FavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final RestaurantRepository restaurantRepository;

    @Override
    public List<FavoriteResponse> getByUserId(Long userId) {
        log.info("Getting favorites for user: {}", userId);
        return favoriteRepository.findByUserId(userId).stream()
                .map(this::toFavoriteResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FavoriteResponse add(Long userId, FavoriteRequest request) {
        log.info("Adding favorite for user: {}, restaurant: {}", userId, request.getRestaurantId());
        
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        
        if (favoriteRepository.existsByUserIdAndRestaurantId(userId, request.getRestaurantId())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Restaurant already in favorites");
        }
        
        Favorite favorite = Favorite.builder()
                .userId(userId)
                .restaurantId(request.getRestaurantId())
                .build();
        
        favorite = favoriteRepository.save(favorite);
        log.info("Favorite added with id: {}", favorite.getId());
        
        return toFavoriteResponse(favorite);
    }

    @Override
    @Transactional
    public void remove(Long userId, Long restaurantId) {
        log.info("Removing favorite for user: {}, restaurant: {}", userId, restaurantId);
        
        if (!favoriteRepository.existsByUserIdAndRestaurantId(userId, restaurantId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Favorite not found");
        }
        
        favoriteRepository.deleteByUserIdAndRestaurantId(userId, restaurantId);
        log.info("Favorite removed");
    }

    @Override
    public boolean check(Long userId, Long restaurantId) {
        log.info("Checking favorite for user: {}, restaurant: {}", userId, restaurantId);
        return favoriteRepository.existsByUserIdAndRestaurantId(userId, restaurantId);
    }

    private FavoriteResponse toFavoriteResponse(Favorite favorite) {
        Restaurant restaurant = restaurantRepository.findById(favorite.getRestaurantId()).orElse(null);
        
        String restaurantName = restaurant != null ? restaurant.getName() : null;
        String restaurantImage = restaurant != null ? restaurant.getImageUrl() : null;
        Double restaurantRating = restaurant != null ? restaurant.getRating() : null;
        
        return FavoriteResponse.builder()
                .id(favorite.getId())
                .userId(favorite.getUserId())
                .restaurantId(favorite.getRestaurantId())
                .restaurantName(restaurantName)
                .restaurantImage(restaurantImage)
                .restaurantRating(restaurantRating)
                .createdAt(favorite.getCreatedAt())
                .build();
    }
}
