package com.cwj.munchgobackend.service.interfaces;

import com.cwj.munchgobackend.model.dto.request.LoginRequest;
import com.cwj.munchgobackend.model.dto.request.RefreshTokenRequest;
import com.cwj.munchgobackend.model.dto.request.RegisterRequest;
import com.cwj.munchgobackend.model.dto.response.AuthResponse;
import com.cwj.munchgobackend.model.dto.response.UserResponse;

import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void logout(HttpServletRequest request);

    UserResponse getCurrentUser(HttpServletRequest request);
}
