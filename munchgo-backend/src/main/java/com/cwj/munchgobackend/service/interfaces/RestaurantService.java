package com.cwj.munchgobackend.service.interfaces;

import com.cwj.munchgobackend.model.dto.request.RestaurantRequest;
import com.cwj.munchgobackend.model.dto.request.RestaurantStatusRequest;
import com.cwj.munchgobackend.model.dto.response.PageResponse;
import com.cwj.munchgobackend.model.dto.response.RestaurantResponse;
import com.cwj.munchgobackend.model.dto.response.RestaurantStatsResponse;
import com.cwj.munchgobackend.model.enums.RestaurantStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RestaurantService {

    PageResponse<RestaurantResponse> search(String keyword, RestaurantStatus status, Pageable pageable);

    RestaurantResponse getById(Long id);

    RestaurantResponse create(Long userId, RestaurantRequest request);

    RestaurantResponse update(Long id, RestaurantRequest request, Long userId);

    RestaurantResponse updateStatus(Long id, RestaurantStatusRequest request, Long userId);

    RestaurantStatsResponse getStats(Long id, Long userId);

    List<RestaurantResponse> getByUserId(Long userId);

    void delete(Long id);
}
