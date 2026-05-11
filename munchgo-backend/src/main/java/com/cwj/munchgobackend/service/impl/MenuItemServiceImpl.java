package com.cwj.munchgobackend.service.impl;

import com.cwj.munchgobackend.exception.BusinessException;
import com.cwj.munchgobackend.exception.ErrorCode;
import com.cwj.munchgobackend.model.dto.request.MenuItemRequest;
import com.cwj.munchgobackend.model.dto.request.MenuItemStatusRequest;
import com.cwj.munchgobackend.model.dto.response.MenuItemResponse;
import com.cwj.munchgobackend.model.dto.response.PageResponse;
import com.cwj.munchgobackend.model.entity.Category;
import com.cwj.munchgobackend.model.entity.MenuItem;
import com.cwj.munchgobackend.model.entity.Restaurant;
import com.cwj.munchgobackend.repository.CategoryRepository;
import com.cwj.munchgobackend.repository.MenuItemRepository;
import com.cwj.munchgobackend.repository.RestaurantRepository;
import com.cwj.munchgobackend.service.interfaces.MenuItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public PageResponse<MenuItemResponse> getByRestaurantId(Long restaurantId, Pageable pageable) {
        log.info("Getting menu items for restaurant: {}", restaurantId);
        Page<MenuItem> menuItemPage = menuItemRepository.findByRestaurantId(restaurantId, pageable);
        Page<MenuItemResponse> responsePage = menuItemPage.map(this::toMenuItemResponse);
        return PageResponse.<MenuItemResponse>builder()
                .content(responsePage.getContent())
                .page(responsePage.getNumber())
                .size(responsePage.getSize())
                .totalElements(responsePage.getTotalElements())
                .totalPages(responsePage.getTotalPages())
                .first(responsePage.isFirst())
                .last(responsePage.isLast())
                .build();
    }

    @Override
    public MenuItemResponse getById(Long id) {
        log.info("Getting menu item by id: {}", id);
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENU_ITEM_NOT_FOUND));
        return toMenuItemResponse(menuItem);
    }

    @Override
    @Transactional
    public MenuItemResponse create(Long restaurantId, MenuItemRequest request, Long userId) {
        log.info("Creating menu item for restaurant: {} by user: {}", restaurantId, userId);
        
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        
        if (!restaurant.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only manage your own restaurant menu items");
        }
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
            if (!category.getRestaurantId().equals(restaurantId)) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "Category does not belong to this restaurant");
            }
        }
        
        MenuItem menuItem = MenuItem.builder()
                .restaurantId(restaurantId)
                .categoryId(request.getCategoryId())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .tags(request.getTags())
                .build();
        
        menuItem = menuItemRepository.save(menuItem);
        log.info("Menu item created with id: {}", menuItem.getId());
        
        return toMenuItemResponse(menuItem);
    }

    @Override
    @Transactional
    public MenuItemResponse update(Long id, MenuItemRequest request, Long userId) {
        log.info("Updating menu item id: {} by user: {}", id, userId);
        
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENU_ITEM_NOT_FOUND));
        
        Restaurant restaurant = restaurantRepository.findById(menuItem.getRestaurantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        
        if (!restaurant.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only manage your own restaurant menu items");
        }
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
            if (!category.getRestaurantId().equals(menuItem.getRestaurantId())) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "Category does not belong to this restaurant");
            }
            menuItem.setCategoryId(request.getCategoryId());
        }
        
        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        menuItem.setImageUrl(request.getImageUrl());
        if (request.getAvailable() != null) {
            menuItem.setAvailable(request.getAvailable());
        }
        menuItem.setTags(request.getTags());
        
        menuItem = menuItemRepository.save(menuItem);
        log.info("Menu item updated: {}", id);
        
        return toMenuItemResponse(menuItem);
    }

    @Override
    @Transactional
    public MenuItemResponse updateAvailability(Long id, MenuItemStatusRequest request, Long userId) {
        log.info("Updating availability for menu item id: {} to {}", id, request.getAvailable());
        
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENU_ITEM_NOT_FOUND));
        
        Restaurant restaurant = restaurantRepository.findById(menuItem.getRestaurantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        
        if (!restaurant.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only manage your own restaurant menu items");
        }
        
        menuItem.setAvailable(request.getAvailable());
        menuItem = menuItemRepository.save(menuItem);
        
        return toMenuItemResponse(menuItem);
    }

    @Override
    @Transactional
    public void delete(Long id, Long userId) {
        log.info("Deleting menu item id: {} by user: {}", id, userId);
        
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.MENU_ITEM_NOT_FOUND));
        
        Restaurant restaurant = restaurantRepository.findById(menuItem.getRestaurantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        
        if (!restaurant.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only manage your own restaurant menu items");
        }
        
        menuItemRepository.delete(menuItem);
        log.info("Menu item deleted: {}", id);
    }

    private MenuItemResponse toMenuItemResponse(MenuItem menuItem) {
        String categoryName = null;
        if (menuItem.getCategoryId() != null) {
            categoryName = categoryRepository.findById(menuItem.getCategoryId())
                    .map(Category::getName)
                    .orElse(null);
        }
        
        return MenuItemResponse.builder()
                .id(menuItem.getId())
                .restaurantId(menuItem.getRestaurantId())
                .categoryId(menuItem.getCategoryId())
                .categoryName(categoryName)
                .name(menuItem.getName())
                .description(menuItem.getDescription())
                .price(menuItem.getPrice())
                .imageUrl(menuItem.getImageUrl())
                .available(menuItem.getAvailable())
                .tags(menuItem.getTags())
                .createdAt(menuItem.getCreatedAt())
                .build();
    }
}
