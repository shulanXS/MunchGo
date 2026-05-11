package com.cwj.munchgobackend.model.enums;

import lombok.Getter;

/**
 * Enumeration of restaurant operational statuses.
 * Indicates whether a restaurant is currently accepting orders.
 */
@Getter
public enum RestaurantStatus {
    
    /**
     * Restaurant is open and accepting orders.
     */
    OPEN,
    
    /**
     * Restaurant is currently closed and not accepting orders.
     */
    CLOSED,
    
    /**
     * Restaurant is suspended by an administrator and cannot accept orders.
     */
    SUSPENDED
}
