package com.cwj.munchgobackend.service.impl;

import com.cwj.munchgobackend.exception.BusinessException;
import com.cwj.munchgobackend.exception.ErrorCode;
import com.cwj.munchgobackend.model.dto.request.CategoryRequest;
import com.cwj.munchgobackend.model.dto.response.CategoryResponse;
import com.cwj.munchgobackend.model.entity.Category;
import com.cwj.munchgobackend.model.entity.MenuItem;
import com.cwj.munchgobackend.model.entity.Restaurant;
import com.cwj.munchgobackend.repository.CategoryRepository;
import com.cwj.munchgobackend.repository.MenuItemRepository;
import com.cwj.munchgobackend.repository.RestaurantRepository;
import com.cwj.munchgobackend.service.interfaces.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    public List<CategoryResponse> getByRestaurantId(Long restaurantId) {
        log.info("Getting categories for restaurant: {}", restaurantId);
        return categoryRepository.findByRestaurantIdOrderBySortOrderAsc(restaurantId).stream()
                .map(this::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryResponse create(Long restaurantId, CategoryRequest request, Long userId) {
        log.info("Creating category for restaurant: {} by user: {}", restaurantId, userId);
        
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        
        if (!restaurant.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only manage your own restaurant categories");
        }
        
        Category category = Category.builder()
                .restaurantId(restaurantId)
                .name(request.getName())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();
        
        category = categoryRepository.save(category);
        log.info("Category created with id: {}", category.getId());
        
        return toCategoryResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request, Long userId) {
        log.info("Updating category id: {} by user: {}", id, userId);
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
        
        Restaurant restaurant = restaurantRepository.findById(category.getRestaurantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        
        if (!restaurant.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only manage your own restaurant categories");
        }
        
        category.setName(request.getName());
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }
        
        category = categoryRepository.save(category);
        log.info("Category updated: {}", id);
        
        return toCategoryResponse(category);
    }

    @Override
    @Transactional
    public void delete(Long id, Long userId) {
        log.info("Deleting category id: {} by user: {}", id, userId);
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));
        
        Restaurant restaurant = restaurantRepository.findById(category.getRestaurantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        
        if (!restaurant.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only manage your own restaurant categories");
        }
        
        categoryRepository.delete(category);
        log.info("Category deleted: {}", id);
    }

    private CategoryResponse toCategoryResponse(Category category) {
        List<MenuItem> menuItems = menuItemRepository.findByCategoryId(category.getId(), org.springframework.data.domain.Pageable.unpaged())
                .getContent();
        
        return CategoryResponse.builder()
                .id(category.getId())
                .restaurantId(category.getRestaurantId())
                .name(category.getName())
                .sortOrder(category.getSortOrder())
                .menuItemCount((long) menuItems.size())
                .build();
    }
}
