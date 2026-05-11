package com.cwj.munchgobackend.service.interfaces;

import com.cwj.munchgobackend.model.dto.request.ChangePasswordRequest;
import com.cwj.munchgobackend.model.dto.request.UpdateUserRequest;
import com.cwj.munchgobackend.model.dto.response.PageResponse;
import com.cwj.munchgobackend.model.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

public interface UserService {

    UserResponse getById(Long id);

    UserResponse update(Long id, UpdateUserRequest request, Long currentUserId);

    void changePassword(Long id, ChangePasswordRequest request, Long currentUserId);

    PageResponse<UserResponse> getAll(Pageable pageable);

    void delete(Long id);
}
