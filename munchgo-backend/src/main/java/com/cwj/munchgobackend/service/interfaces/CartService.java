package com.cwj.munchgobackend.service.interfaces;

import com.cwj.munchgobackend.model.dto.request.CartItemRequest;
import com.cwj.munchgobackend.model.dto.response.CartResponse;

public interface CartService {

    CartResponse getCart(Long userId);

    CartResponse addItem(Long userId, CartItemRequest request);

    CartResponse updateItem(Long itemId, CartItemRequest request, Long userId);

    CartResponse removeItem(Long itemId, Long userId);

    void clearCart(Long userId);
}
