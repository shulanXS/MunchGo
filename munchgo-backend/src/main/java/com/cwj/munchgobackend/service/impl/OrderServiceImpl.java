package com.cwj.munchgobackend.service.impl;

import com.cwj.munchgobackend.exception.BusinessException;
import com.cwj.munchgobackend.exception.ErrorCode;
import com.cwj.munchgobackend.model.dto.request.CreateOrderRequest;
import com.cwj.munchgobackend.model.dto.response.AddressResponse;
import com.cwj.munchgobackend.model.dto.response.OrderItemResponse;
import com.cwj.munchgobackend.model.dto.response.OrderResponse;
import com.cwj.munchgobackend.model.dto.response.OrderStatsResponse;
import com.cwj.munchgobackend.model.dto.response.PageResponse;
import com.cwj.munchgobackend.model.entity.*;
import com.cwj.munchgobackend.model.enums.OrderStatus;
import com.cwj.munchgobackend.model.enums.UserRole;
import com.cwj.munchgobackend.repository.*;
import com.cwj.munchgobackend.service.interfaces.OrderService;
import com.cwj.munchgobackend.util.SnowflakeIdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final AddressRepository addressRepository;
    private final MenuItemRepository menuItemRepository;
    private final SnowflakeIdGenerator snowflakeIdGenerator;

    @Override
    @Transactional
    public OrderResponse create(Long userId, CreateOrderRequest request) {
        log.info("Creating order for user: {}", userId);
        
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CART_EMPTY, "Cart not found"));
        
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        
        if (cartItems.isEmpty()) {
            throw new BusinessException(ErrorCode.CART_EMPTY);
        }
        
        Restaurant restaurant = restaurantRepository.findById(cart.getRestaurantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESTAURANT_NOT_FOUND));
        
        Address deliveryAddress = addressRepository.findById(request.getDeliveryAddressId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Delivery address not found"));
        
        if (!deliveryAddress.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Invalid delivery address");
        }
        
        String orderNo = generateOrderNo();
        
        List<OrderItem> orderItems = cartItems.stream()
                .map(cartItem -> {
                    MenuItem menuItem = menuItemRepository.findById(cartItem.getMenuItemId())
                            .orElse(null);
                    String itemName = menuItem != null ? menuItem.getName() : "Unknown Item";
                    BigDecimal itemPrice = menuItem != null ? menuItem.getPrice() : BigDecimal.ZERO;
                    BigDecimal subtotal = itemPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
                    
                    return OrderItem.builder()
                            .orderId(null)
                            .menuItemId(cartItem.getMenuItemId())
                            .name(itemName)
                            .price(itemPrice)
                            .quantity(cartItem.getQuantity())
                            .subtotal(subtotal)
                            .build();
                })
                .collect(Collectors.toList());
        
        BigDecimal totalAmount = orderItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal finalAmount = totalAmount.add(restaurant.getDeliveryFee());
        
        Order order = Order.builder()
                .orderNo(orderNo)
                .userId(userId)
                .restaurantId(cart.getRestaurantId())
                .status(OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .deliveryFee(restaurant.getDeliveryFee())
                .discountAmount(BigDecimal.ZERO)
                .finalAmount(finalAmount)
                .deliveryAddressId(request.getDeliveryAddressId())
                .remark(request.getRemark())
                .build();
        
        order = orderRepository.save(order);
        
        for (OrderItem item : orderItems) {
            item.setOrderId(order.getId());
        }
        orderItemRepository.saveAll(orderItems);
        
        cartItemRepository.deleteByCartId(cart.getId());
        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);
        
        log.info("Order created with id: {}, orderNo: {}", order.getId(), orderNo);
        
        return toOrderResponse(order, orderItems);
    }

    @Override
    public OrderResponse getById(Long id, Long userId, String userRole) {
        log.info("Getting order by id: {} for user: {}", id, userId);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        
        if (!canAccessOrder(order, userId, userRole)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You do not have access to this order");
        }
        
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(id);
        
        return toOrderResponse(order, orderItems);
    }

    @Override
    public PageResponse<OrderResponse> getByUserId(Long userId, Pageable pageable) {
        log.info("Getting orders for user: {}", userId);
        Page<Order> orderPage = orderRepository.findByUserId(userId, pageable);
        return toPageResponse(orderPage);
    }

    @Override
    public PageResponse<OrderResponse> getByRestaurantId(Long restaurantId, Pageable pageable) {
        log.info("Getting orders for restaurant: {}", restaurantId);
        Page<Order> orderPage = orderRepository.findByRestaurantId(restaurantId, pageable);
        return toPageResponse(orderPage);
    }

    @Override
    public PageResponse<OrderResponse> getByRiderId(Long riderId, Pageable pageable) {
        log.info("Getting orders for rider: {}", riderId);
        Page<Order> orderPage = orderRepository.findByRiderId(riderId, pageable);
        return toPageResponse(orderPage);
    }

    @Override
    public PageResponse<OrderResponse> getByRestaurantIds(List<Long> restaurantIds, Pageable pageable) {
        log.info("Getting orders for restaurant ids: {}", restaurantIds);
        Page<Order> orderPage = orderRepository.findByRestaurantIdIn(restaurantIds, pageable);
        return toPageResponse(orderPage);
    }

    @Override
    public PageResponse<OrderResponse> getAll(Pageable pageable) {
        log.info("Getting all orders for admin");
        Page<Order> orderPage = orderRepository.findAll(pageable);
        return toPageResponse(orderPage);
    }

    @Override
    public Object getStats() {
        log.info("Getting order statistics");
        long total = orderRepository.count();
        long pending = orderRepository.countByStatus(OrderStatus.PENDING);
        long completed = orderRepository.countByStatus(OrderStatus.COMPLETED);
        long cancelled = orderRepository.countByStatus(OrderStatus.CANCELLED);
        return OrderStatsResponse.builder()
                .total(total)
                .pending(pending)
                .completed(completed)
                .cancelled(cancelled)
                .build();
    }

    @Override
    public PageResponse<OrderResponse> getAvailableOrders(Pageable pageable) {
        log.info("Getting available orders for rider pool");
        Page<Order> orderPage = orderRepository.findByStatus(OrderStatus.READY, pageable);
        return toPageResponse(orderPage);
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus newStatus, Long userId, String userRole) {
        log.info("Updating status for order: {} to {} by user: {}", id, newStatus, userId);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        OrderStatus currentStatus = order.getStatus();

        boolean canTransition = switch (userRole) {
            case "MERCHANT" -> canMerchantTransition(currentStatus, newStatus);
            case "RIDER" -> canRiderTransition(currentStatus, newStatus);
            case "ADMIN" -> true;
            default -> false;
        };

        if (!canTransition) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Cannot transition from " + currentStatus + " to " + newStatus);
        }

        if ("RIDER".equals(userRole) && newStatus == OrderStatus.DELIVERING) {
            if (order.getRiderId() != null) {
                throw new BusinessException(ErrorCode.ORDER_ALREADY_ASSIGNED,
                        "This order has already been assigned to another rider");
            }
            order.setRiderId(userId);
        }

        order.setStatus(newStatus);

        if (newStatus == OrderStatus.COMPLETED) {
            order.setPaidAt(LocalDateTime.now());
        }

        order = orderRepository.save(order);

        List<OrderItem> orderItems = orderItemRepository.findByOrderId(id);

        return toOrderResponse(order, orderItems);
    }

    @Override
    @Transactional
    public OrderResponse cancel(Long id, Long userId) {
        log.info("Cancelling order: {} by user: {}", id, userId);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        
        if (!order.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only cancel your own orders");
        }
        
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException(ErrorCode.ORDER_CANNOT_BE_CANCELLED);
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);
        
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(id);
        
        return toOrderResponse(order, orderItems);
    }

    @Override
    @Transactional
    public void delete(Long id, Long userId) {
        log.info("Deleting order: {} by user: {}", id, userId);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        
        if (!order.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only delete your own orders");
        }
        
        if (order.getStatus() != OrderStatus.CANCELLED) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Only cancelled orders can be deleted");
        }
        
        orderItemRepository.findByOrderId(id).forEach(orderItemRepository::delete);
        orderRepository.delete(order);
        
        log.info("Order deleted: {}", id);
    }

    private boolean canMerchantTransition(OrderStatus from, OrderStatus to) {
        return switch (from) {
            case PENDING -> to == OrderStatus.CONFIRMED || to == OrderStatus.CANCELLED;
            case CONFIRMED -> to == OrderStatus.PREPARING;
            case PREPARING -> to == OrderStatus.READY;
            default -> false;
        };
    }

    private boolean canRiderTransition(OrderStatus from, OrderStatus to) {
        return switch (from) {
            case READY -> to == OrderStatus.DELIVERING;
            case DELIVERING -> to == OrderStatus.COMPLETED;
            default -> false;
        };
    }

    private boolean canAccessOrder(Order order, Long userId, String userRole) {
        return switch (userRole) {
            case "ADMIN" -> true;
            case "CUSTOMER" -> order.getUserId().equals(userId);
            case "MERCHANT" -> {
                Restaurant restaurant = restaurantRepository.findById(order.getRestaurantId()).orElse(null);
                yield restaurant != null && restaurant.getUserId().equals(userId);
            }
            case "RIDER" ->
                (order.getRiderId() != null && order.getRiderId().equals(userId))
                    || order.getStatus() == OrderStatus.READY;
            default -> false;
        };
    }

    private String generateOrderNo() {
        return "ORD" + snowflakeIdGenerator.nextIdString();
    }

    private PageResponse<OrderResponse> toPageResponse(Page<Order> orderPage) {
        List<OrderResponse> responses = orderPage.getContent().stream()
                .map(order -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
                    return toOrderResponse(order, items);
                })
                .collect(Collectors.toList());
        
        return PageResponse.<OrderResponse>builder()
                .content(responses)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .first(orderPage.isFirst())
                .last(orderPage.isLast())
                .build();
    }

    private OrderResponse toOrderResponse(Order order, List<OrderItem> orderItems) {
        String restaurantName = restaurantRepository.findById(order.getRestaurantId())
                .map(Restaurant::getName)
                .orElse(null);
        
        AddressResponse addressResponse = null;
        if (order.getDeliveryAddressId() != null) {
            addressResponse = addressRepository.findById(order.getDeliveryAddressId())
                    .map(addr -> AddressResponse.builder()
                            .id(addr.getId())
                            .userId(addr.getUserId())
                            .label(addr.getLabel())
                            .detail(addr.getDetail())
                            .latitude(addr.getLatitude())
                            .longitude(addr.getLongitude())
                            .isDefault(addr.getIsDefault())
                            .createdAt(addr.getCreatedAt())
                            .build())
                    .orElse(null);
        }
        
        List<OrderItemResponse> itemResponses = orderItems.stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItemId())
                        .name(item.getName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());
        
        return OrderResponse.builder()
                .id(order.getId())
                .orderNo(order.getOrderNo())
                .userId(order.getUserId())
                .restaurantId(order.getRestaurantId())
                .restaurantName(restaurantName)
                .riderId(order.getRiderId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .deliveryFee(order.getDeliveryFee())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .deliveryAddress(addressResponse)
                .remark(order.getRemark())
                .items(itemResponses)
                .paidAt(order.getPaidAt())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
