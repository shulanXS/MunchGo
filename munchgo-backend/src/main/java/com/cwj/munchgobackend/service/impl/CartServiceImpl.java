package com.cwj.munchgobackend.service.impl;

import com.cwj.munchgobackend.exception.BusinessException;
import com.cwj.munchgobackend.exception.ErrorCode;
import com.cwj.munchgobackend.model.dto.request.CartItemRequest;
import com.cwj.munchgobackend.model.dto.response.CartItemResponse;
import com.cwj.munchgobackend.model.dto.response.CartResponse;
import com.cwj.munchgobackend.model.entity.Cart;
import com.cwj.munchgobackend.model.entity.CartItem;
import com.cwj.munchgobackend.model.entity.MenuItem;
import com.cwj.munchgobackend.model.entity.Restaurant;
import com.cwj.munchgobackend.repository.CartItemRepository;
import com.cwj.munchgobackend.repository.CartRepository;
import com.cwj.munchgobackend.repository.MenuItemRepository;
import com.cwj.munchgobackend.repository.RestaurantRepository;
import com.cwj.munchgobackend.service.interfaces.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;

    @Override
    public CartResponse getCart(Long userId) {
        log.info("Getting cart for user: {}", userId);
        
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        
        if (cartOpt.isEmpty()) {
            return buildEmptyCartResponse(userId);
        }
        
        Cart cart = cartOpt.get();
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        
        if (cartItems.isEmpty()) {
            cart.setTotalAmount(BigDecimal.ZERO);
            cartRepository.save(cart);
            return buildEmptyCartResponse(userId);
        }
        
        return toCartResponse(cart, cartItems);
    }

    @Override
    @Transactional
    public CartResponse addItem(Long userId, CartItemRequest request) {
        log.info("Adding item to cart for user: {}, menuItemId: {}", userId, request.getMenuItemId());
        
        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MENU_ITEM_NOT_FOUND));
        
        if (!Boolean.TRUE.equals(menuItem.getAvailable())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Menu item is not available");
        }
        
        Long newRestaurantId = menuItem.getRestaurantId();
        
        Optional<Cart> existingCartOpt = cartRepository.findByUserId(userId);
        
        if (existingCartOpt.isPresent()) {
            Cart existingCart = existingCartOpt.get();
            
            if (!existingCart.getRestaurantId().equals(newRestaurantId)) {
                log.info("Cart has items from different restaurant, clearing cart");
                cartItemRepository.deleteByCartId(existingCart.getId());
                existingCart.setRestaurantId(newRestaurantId);
                existingCart.setTotalAmount(BigDecimal.ZERO);
                cartRepository.save(existingCart);
            }
        }
        
        Cart cart = existingCartOpt.orElseGet(() -> {
            Cart newCart = Cart.builder()
                    .userId(userId)
                    .restaurantId(newRestaurantId)
                    .totalAmount(BigDecimal.ZERO)
                    .build();
            return cartRepository.save(newCart);
        });
        
        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndMenuItemId(cart.getId(), request.getMenuItemId());
        
        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            cartItemRepository.save(existingItem);
            log.info("Updated existing cart item quantity");
        } else {
            CartItem newItem = CartItem.builder()
                    .cartId(cart.getId())
                    .menuItemId(request.getMenuItemId())
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newItem);
            log.info("Added new item to cart");
        }
        
        recalculateCartTotal(cart);
        
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        return toCartResponse(cart, cartItems);
    }

    @Override
    @Transactional
    public CartResponse updateItem(Long itemId, CartItemRequest request, Long userId) {
        log.info("Updating cart item: {} for user: {}", itemId, userId);
        
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Cart item not found"));
        
        Cart cart = cartRepository.findById(cartItem.getCartId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Cart not found"));
        
        if (!cart.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only update your own cart items");
        }
        
        if (request.getQuantity() <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(request.getQuantity());
            cartItemRepository.save(cartItem);
        }
        
        recalculateCartTotal(cart);
        
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        
        if (cartItems.isEmpty()) {
            return buildEmptyCartResponse(userId);
        }
        
        return toCartResponse(cart, cartItems);
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long itemId, Long userId) {
        log.info("Removing cart item: {} for user: {}", itemId, userId);
        
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Cart item not found"));
        
        Cart cart = cartRepository.findById(cartItem.getCartId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Cart not found"));
        
        if (!cart.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only remove your own cart items");
        }
        
        cartItemRepository.delete(cartItem);
        
        recalculateCartTotal(cart);
        
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        
        if (cartItems.isEmpty()) {
            return buildEmptyCartResponse(userId);
        }
        
        return toCartResponse(cart, cartItems);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        log.info("Clearing cart for user: {}", userId);
        
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            cartItemRepository.deleteByCartId(cart.getId());
            cart.setTotalAmount(BigDecimal.ZERO);
            cartRepository.save(cart);
        }
    }

    private void recalculateCartTotal(Cart cart) {
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        
        BigDecimal total = cartItems.stream()
                .map(item -> {
                    MenuItem menuItem = menuItemRepository.findById(item.getMenuItemId()).orElse(null);
                    if (menuItem != null) {
                        return menuItem.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        cart.setTotalAmount(total);
        cartRepository.save(cart);
    }

    private CartResponse buildEmptyCartResponse(Long userId) {
        return CartResponse.builder()
                .id(null)
                .userId(userId)
                .restaurantId(null)
                .restaurantName(null)
                .items(new ArrayList<>())
                .totalAmount(BigDecimal.ZERO)
                .build();
    }

    private CartResponse toCartResponse(Cart cart, List<CartItem> cartItems) {
        String restaurantName = restaurantRepository.findById(cart.getRestaurantId())
                .map(Restaurant::getName)
                .orElse(null);
        
        List<CartItemResponse> itemResponses = cartItems.stream()
                .map(this::toCartItemResponse)
                .collect(Collectors.toList());
        
        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUserId())
                .restaurantId(cart.getRestaurantId())
                .restaurantName(restaurantName)
                .items(itemResponses)
                .totalAmount(cart.getTotalAmount())
                .build();
    }

    private CartItemResponse toCartItemResponse(CartItem cartItem) {
        MenuItem menuItem = menuItemRepository.findById(cartItem.getMenuItemId()).orElse(null);
        
        String name = menuItem != null ? menuItem.getName() : "Unknown Item";
        String image = menuItem != null ? menuItem.getImageUrl() : null;
        BigDecimal price = menuItem != null ? menuItem.getPrice() : BigDecimal.ZERO;
        BigDecimal subtotal = price.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
        
        return CartItemResponse.builder()
                .id(cartItem.getId())
                .menuItemId(cartItem.getMenuItemId())
                .menuItemName(name)
                .menuItemImage(image)
                .price(price)
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}
