package com.cwj.munchgobackend.model.dto.response;

import com.cwj.munchgobackend.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;

    private String username;

    private String email;

    private String phone;

    private UserRole role;

    private String avatarUrl;

    private LocalDateTime createdAt;
}
