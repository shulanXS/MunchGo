package com.cwj.munchgobackend.service.impl;

import com.cwj.munchgobackend.exception.BusinessException;
import com.cwj.munchgobackend.exception.ErrorCode;
import com.cwj.munchgobackend.model.dto.request.RestaurantRequest;
import com.cwj.munchgobackend.model.dto.request.RestaurantStatusRequest;
import com.cwj.munchgobackend.model.dto.response.PageResponse;
import com.cwj.munchgobackend.model.dto.response.RestaurantResponse;
import com.cwj.munchgobackend.model.dto.response.RestaurantStatsResponse;
import com.cwj.munchgobackend.model.entity.Order;
import com.cwj.munchgobackend.model.entity.Restaurant;
import com.cwj.munchgobackend.model.entity.User;
import com.cwj.munchgobackend.model.enums.OrderStatus;
import com.cwj.munchgobackend.model.enums.RestaurantStatus;
import com.cwj.munchgobackend.model.enums.UserRole;
import com.cwj.munchgobackend.repository.OrderRepository;
import com.cwj.munchgobackend.repository.RestaurantRepository;
import com.cwj.munchgobackend.repository.ReviewRepository;
import com.cwj.munchgobackend.repository.UserRepository;
import com.cwj.munchgobackend.service.interfaces.RestaurantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;

    @Override
    public PageResponse<RestaurantResponse> search(String keyword, RestaurantStatus status, Pageable pageable) {
        log.info("Searching restaurants with keyword: {}, status: {}", keyword, status);
        
        Page<Restaurant> restaurantPage;

        if (StringUtils.hasText(keyword) && status != null) {
            restaurantPage = restaurantRepository.findByNameContainingIgnoreCaseAndStatus(keyword, status, pageable);
        } else if (StringUtils.hasText(keyword)) {
            restaurantPage = restaurantRepository.findByNameContainingIgnoreCase(keyword, pageable);
        } else if (status != null) {
            restaurantPage = restaurantRepository.findByStatus(status, pageable);
        } else {
            restaurantPage = restaurantRepository.findAll(pageable);
        }
        
        List<RestaurantResponse> content = restaurantPage.getContent().stream()
                .map(this::toRestaurantResponse)
                .collect(Collectors.toList());

        return PageResponse.<RestaurantResponse>builder()
                .content(content)
                .page(restaurantPage.getNumber())
                .size(restaurantPage.getSize())
                .totalElements(restaurantPage.getTotalElements())
                .totalPages(restaurantPage.getTotalPages())
                .first(restaurantPage.isFirst())
                .last(restaurantPage.isLast())
                .build();
    }

    @Override
    public RestaurantResponse getById(Long id) {
        log.info("Getting restaurant by id: {}", id);
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        return toRestaurantResponse(restaurant);
    }

    @Override
    @Transactional
    public RestaurantResponse create(Long userId, RestaurantRequest request) {
        log.info("Creating restaurant for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        
        if (user.getRole() != UserRole.MERCHANT) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Only merchants can create restaurants");
        }
        
        Restaurant restaurant = Restaurant.builder()
                .userId(userId)
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .phone(request.getPhone())
                .cuisineType(request.getCuisineType())
                .imageUrl(request.getImageUrl())
                .status(RestaurantStatus.OPEN)
                .minOrderAmount(request.getMinOrderAmount())
                .deliveryFee(request.getDeliveryFee())
                .rating(0.0)
                .build();
        
        restaurant = restaurantRepository.save(restaurant);
        log.info("Restaurant created with id: {}", restaurant.getId());
        
        return toRestaurantResponse(restaurant);
    }

    @Override
    @Transactional
    public RestaurantResponse update(Long id, RestaurantRequest request, Long userId) {
        log.info("Updating restaurant id: {} by user: {}", id, userId);
        
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        
        if (!restaurant.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only update your own restaurant");
        }
        
        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setAddress(request.getAddress());
        restaurant.setPhone(request.getPhone());
        restaurant.setCuisineType(request.getCuisineType());
        restaurant.setImageUrl(request.getImageUrl());
        restaurant.setMinOrderAmount(request.getMinOrderAmount());
        restaurant.setDeliveryFee(request.getDeliveryFee());
        
        restaurant = restaurantRepository.save(restaurant);
        log.info("Restaurant updated: {}", id);
        
        return toRestaurantResponse(restaurant);
    }

    @Override
    @Transactional
    public RestaurantResponse updateStatus(Long id, RestaurantStatusRequest request, Long userId) {
        log.info("Updating status for restaurant id: {} to {}", id, request.getStatus());
        
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        
        if (!restaurant.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only update your own restaurant");
        }
        
        restaurant.setStatus(request.getStatus());
        restaurant = restaurantRepository.save(restaurant);
        
        return toRestaurantResponse(restaurant);
    }

    @Override
    public RestaurantStatsResponse getStats(Long id, Long userId) {
        log.info("Getting stats for restaurant id: {}", id);
        
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        
        if (!restaurant.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only view your own restaurant stats");
        }
        
        List<Order> allOrders = orderRepository.findByRestaurantId(id, Pageable.unpaged()).getContent();
        
        long totalOrders = allOrders.size();
        long completedOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .count();
        
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long todayOrders = allOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(startOfDay))
                .count();
        
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Double avgRating = restaurant.getRating();
        
        return RestaurantStatsResponse.builder()
                .totalOrders(totalOrders)
                .todayOrders(todayOrders)
                .totalRevenue(totalRevenue)
                .avgRating(avgRating)
                .build();
    }

    @Override
    public List<RestaurantResponse> getByUserId(Long userId) {
        log.info("Getting restaurants for user: {}", userId);
        return restaurantRepository.findByUserId(userId).stream()
                .map(this::toRestaurantResponse)
                .collect(Collectors.toList());
    }

    private RestaurantResponse toRestaurantResponse(Restaurant restaurant) {
        String ownerUsername = null;
        if (restaurant.getUserId() != null) {
            ownerUsername = userRepository.findById(restaurant.getUserId())
                    .map(User::getUsername)
                    .orElse(null);
        }
        
        long reviewCount = reviewRepository.countByRestaurantId(restaurant.getId());
        
        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .ownerId(restaurant.getUserId())
                .ownerUsername(ownerUsername)
                .name(restaurant.getName())
                .description(restaurant.getDescription())
                .address(restaurant.getAddress())
                .phone(restaurant.getPhone())
                .cuisineType(restaurant.getCuisineType())
                .imageUrl(restaurant.getImageUrl())
                .rating(restaurant.getRating())
                .reviewCount((int) reviewCount)
                .status(restaurant.getStatus())
                .minOrderAmount(restaurant.getMinOrderAmount())
                .deliveryFee(restaurant.getDeliveryFee())
                .createdAt(restaurant.getCreatedAt())
                .updatedAt(restaurant.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("Deleting restaurant id: {}", id);
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        restaurantRepository.delete(restaurant);
        log.info("Restaurant deleted: {}", id);
    }
}
