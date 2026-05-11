package com.cwj.munchgobackend.service.interfaces;

import com.cwj.munchgobackend.model.dto.request.CategoryRequest;
import com.cwj.munchgobackend.model.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> getByRestaurantId(Long restaurantId);

    CategoryResponse create(Long restaurantId, CategoryRequest request, Long userId);

    CategoryResponse update(Long id, CategoryRequest request, Long userId);

    void delete(Long id, Long userId);
}
