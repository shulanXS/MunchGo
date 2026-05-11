package com.cwj.munchgobackend.model.enums;

import lombok.Getter;

/**
 * Enumeration of order statuses throughout the order lifecycle.
 * Orders progress through these states from creation to completion or cancellation.
 */
@Getter
public enum OrderStatus {
    
    /**
     * Order has been created but not yet confirmed by the restaurant.
     */
    PENDING,
    
    /**
     * Order has been confirmed by the restaurant.
     */
    CONFIRMED,
    
    /**
     * Restaurant is preparing the order.
     */
    PREPARING,
    
    /**
     * Order is ready for pickup/delivery.
     */
    READY,
    
    /**
     * Order is being delivered by a rider.
     */
    DELIVERING,
    
    /**
     * Order has been successfully delivered.
     */
    COMPLETED,
    
    /**
     * Order has been cancelled.
     */
    CANCELLED
}
