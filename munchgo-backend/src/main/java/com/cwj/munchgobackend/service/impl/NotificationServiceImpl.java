package com.cwj.munchgobackend.service.impl;

import com.cwj.munchgobackend.exception.BusinessException;
import com.cwj.munchgobackend.exception.ErrorCode;
import com.cwj.munchgobackend.model.dto.request.NotificationRequest;
import com.cwj.munchgobackend.model.dto.response.NotificationResponse;
import com.cwj.munchgobackend.model.dto.response.PageResponse;
import com.cwj.munchgobackend.model.entity.Notification;
import com.cwj.munchgobackend.repository.NotificationRepository;
import com.cwj.munchgobackend.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public PageResponse<NotificationResponse> getByUserId(Long userId, Pageable pageable) {
        log.info("Getting notifications for user: {}", userId);
        Page<Notification> notificationPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<NotificationResponse> content = notificationPage.getContent().stream()
                .map(this::toNotificationResponse)
                .collect(Collectors.toList());

        return PageResponse.<NotificationResponse>builder()
                .content(content)
                .page(notificationPage.getNumber())
                .size(notificationPage.getSize())
                .totalElements(notificationPage.getTotalElements())
                .totalPages(notificationPage.getTotalPages())
                .first(notificationPage.isFirst())
                .last(notificationPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public void markAsRead(Long id, Long userId) {
        log.info("Marking notification as read: {} for user: {}", id, userId);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only mark your own notifications as read");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
        log.info("Notification marked as read: {}", id);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        log.info("Marking all notifications as read for user: {}", userId);

        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);

        log.info("All notifications marked as read for user: {}", userId);
    }

    @Override
    @Transactional
    public void delete(Long id, Long userId) {
        log.info("Deleting notification: {} for user: {}", id, userId);

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only delete your own notifications");
        }

        notificationRepository.delete(notification);
        log.info("Notification deleted: {}", id);
    }

    @Override
    @Transactional
    public NotificationResponse create(Long userId, NotificationRequest request) {
        log.info("Creating notification for user: {}", userId);

        Notification notification = Notification.builder()
                .userId(userId)
                .type(request.getType())
                .title(request.getTitle())
                .content(request.getContent())
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);
        log.info("Notification created with id: {}", notification.getId());
        return toNotificationResponse(notification);
    }

    @Override
    public long getUnreadCount(Long userId) {
        log.info("Getting unread notification count for user: {}", userId);
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    private NotificationResponse toNotificationResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .type(notification.getType())
                .title(notification.getTitle())
                .content(notification.getContent())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
