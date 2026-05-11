package com.cwj.munchgobackend.service.impl;

import com.cwj.munchgobackend.exception.BusinessException;
import com.cwj.munchgobackend.exception.ErrorCode;
import com.cwj.munchgobackend.model.dto.request.ReviewReplyRequest;
import com.cwj.munchgobackend.model.dto.request.ReviewRequest;
import com.cwj.munchgobackend.model.dto.response.PageResponse;
import com.cwj.munchgobackend.model.dto.response.ReviewResponse;
import com.cwj.munchgobackend.model.entity.Restaurant;
import com.cwj.munchgobackend.model.entity.Review;
import com.cwj.munchgobackend.model.entity.User;
import com.cwj.munchgobackend.repository.RestaurantRepository;
import com.cwj.munchgobackend.repository.ReviewRepository;
import com.cwj.munchgobackend.repository.UserRepository;
import com.cwj.munchgobackend.service.interfaces.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ReviewResponse create(Long userId, ReviewRequest request) {
        log.info("Creating review for user: {}, restaurant: {}", userId, request.getRestaurantId());
        
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        Review review = Review.builder()
                .userId(userId)
                .restaurantId(request.getRestaurantId())
                .orderId(request.getOrderId())
                .rating(request.getRating())
                .content(request.getContent())
                .images(request.getImages())
                .build();
        
        review = reviewRepository.save(review);
        
        updateRestaurantRating(request.getRestaurantId());
        
        log.info("Review created with id: {}", review.getId());
        
        return toReviewResponse(review, user);
    }

    @Override
    public PageResponse<ReviewResponse> getByRestaurantId(Long restaurantId, Pageable pageable) {
        log.info("Getting reviews for restaurant: {}", restaurantId);
        Page<Review> reviewPage = reviewRepository.findByRestaurantId(restaurantId, pageable);
        
        List<ReviewResponse> responses = reviewPage.getContent().stream()
                .map(review -> {
                    User user = userRepository.findById(review.getUserId()).orElse(null);
                    return toReviewResponse(review, user);
                })
                .collect(Collectors.toList());
        
        return PageResponse.<ReviewResponse>builder()
                .content(responses)
                .page(reviewPage.getNumber())
                .size(reviewPage.getSize())
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .first(reviewPage.isFirst())
                .last(reviewPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public ReviewResponse update(Long id, ReviewRequest request, Long userId) {
        log.info("Updating review id: {} by user: {}", id, userId);
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Review not found"));
        
        if (!review.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only update your own reviews");
        }
        
        review.setRating(request.getRating());
        review.setContent(request.getContent());
        if (request.getImages() != null) {
            review.setImages(request.getImages());
        }
        
        review = reviewRepository.save(review);
        
        User user = userRepository.findById(userId).orElse(null);
        
        updateRestaurantRating(review.getRestaurantId());
        
        return toReviewResponse(review, user);
    }

    @Override
    @Transactional
    public void delete(Long id, Long userId) {
        log.info("Deleting review id: {} by user: {}", id, userId);
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Review not found"));
        
        if (!review.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only delete your own reviews");
        }
        
        Long restaurantId = review.getRestaurantId();
        
        reviewRepository.delete(review);
        
        updateRestaurantRating(restaurantId);
        
        log.info("Review deleted: {}", id);
    }

    @Override
    @Transactional
    public ReviewResponse reply(Long id, ReviewReplyRequest request, Long userId) {
        log.info("Replying to review id: {} by user: {}", id, userId);
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Review not found"));
        
        Restaurant restaurant = restaurantRepository.findById(review.getRestaurantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        
        if (!restaurant.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Only restaurant owner can reply to reviews");
        }
        
        review.setReply(request.getReply());
        review.setRepliedAt(LocalDateTime.now());
        
        review = reviewRepository.save(review);
        
        User user = userRepository.findById(review.getUserId()).orElse(null);
        
        return toReviewResponse(review, user);
    }

    private void updateRestaurantRating(Long restaurantId) {
        List<Review> reviews = reviewRepository.findByRestaurantId(restaurantId, Pageable.unpaged()).getContent();
        
        if (reviews.isEmpty()) {
            restaurantRepository.findById(restaurantId).ifPresent(restaurant -> {
                restaurant.setRating(0.0);
                restaurantRepository.save(restaurant);
            });
            return;
        }
        
        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        
        restaurantRepository.findById(restaurantId).ifPresent(restaurant -> {
            restaurant.setRating(Math.round(averageRating * 10.0) / 10.0);
            restaurantRepository.save(restaurant);
        });
    }

    private ReviewResponse toReviewResponse(Review review, User user) {
        String username = user != null ? user.getUsername() : null;
        String userAvatar = user != null ? user.getAvatarUrl() : null;
        
        List<String> imagesList = null;
        if (review.getImages() != null && !review.getImages().isEmpty()) {
            imagesList = Arrays.asList(review.getImages().split(","));
        } else {
            imagesList = Collections.emptyList();
        }
        
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUserId())
                .username(username)
                .userAvatar(userAvatar)
                .restaurantId(review.getRestaurantId())
                .orderId(review.getOrderId())
                .rating(review.getRating())
                .content(review.getContent())
                .images(imagesList)
                .reply(review.getReply())
                .repliedAt(review.getRepliedAt())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
