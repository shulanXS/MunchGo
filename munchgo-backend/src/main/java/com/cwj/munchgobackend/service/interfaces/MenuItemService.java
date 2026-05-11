package com.cwj.munchgobackend.service.interfaces;

import com.cwj.munchgobackend.model.dto.request.MenuItemRequest;
import com.cwj.munchgobackend.model.dto.request.MenuItemStatusRequest;
import com.cwj.munchgobackend.model.dto.response.MenuItemResponse;
import com.cwj.munchgobackend.model.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface MenuItemService {

    PageResponse<MenuItemResponse> getByRestaurantId(Long restaurantId, Pageable pageable);

    MenuItemResponse getById(Long id);

    MenuItemResponse create(Long restaurantId, MenuItemRequest request, Long userId);

    MenuItemResponse update(Long id, MenuItemRequest request, Long userId);

    MenuItemResponse updateAvailability(Long id, MenuItemStatusRequest request, Long userId);

    void delete(Long id, Long userId);
}
