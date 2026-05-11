package com.cwj.munchgobackend.service.interfaces;

import com.cwj.munchgobackend.model.dto.request.ReviewReplyRequest;
import com.cwj.munchgobackend.model.dto.request.ReviewRequest;
import com.cwj.munchgobackend.model.dto.response.PageResponse;
import com.cwj.munchgobackend.model.dto.response.ReviewResponse;
import org.springframework.data.domain.Pageable;

public interface ReviewService {

    ReviewResponse create(Long userId, ReviewRequest request);

    PageResponse<ReviewResponse> getByRestaurantId(Long restaurantId, Pageable pageable);

    ReviewResponse update(Long id, ReviewRequest request, Long userId);

    void delete(Long id, Long userId);

    ReviewResponse reply(Long id, ReviewReplyRequest request, Long userId);
}
