package com.cwj.munchgobackend.service.interfaces;

import com.cwj.munchgobackend.model.dto.request.FavoriteRequest;
import com.cwj.munchgobackend.model.dto.response.FavoriteResponse;

import java.util.List;

public interface FavoriteService {

    List<FavoriteResponse> getByUserId(Long userId);

    FavoriteResponse add(Long userId, FavoriteRequest request);

    void remove(Long userId, Long restaurantId);

    boolean check(Long userId, Long restaurantId);
}
