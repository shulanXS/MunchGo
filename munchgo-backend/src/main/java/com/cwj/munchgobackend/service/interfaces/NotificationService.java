package com.cwj.munchgobackend.service.interfaces;

import com.cwj.munchgobackend.model.dto.request.NotificationRequest;
import com.cwj.munchgobackend.model.dto.response.NotificationResponse;
import com.cwj.munchgobackend.model.dto.response.PageResponse;

import org.springframework.data.domain.Pageable;

public interface NotificationService {

    PageResponse<NotificationResponse> getByUserId(Long userId, Pageable pageable);

    void markAsRead(Long id, Long userId);

    void markAllAsRead(Long userId);

    void delete(Long id, Long userId);

    NotificationResponse create(Long userId, NotificationRequest request);

    long getUnreadCount(Long userId);
}
