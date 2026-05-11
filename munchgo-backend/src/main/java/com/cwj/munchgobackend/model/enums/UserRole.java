package com.cwj.munchgobackend.model.enums;

import lombok.Getter;

/**
 * Enumeration of user roles in the system.
 * Defines the different types of users and their permissions.
 */
@Getter
public enum UserRole {
    
    /**
     * Regular customer who can browse restaurants and place orders.
     */
    CUSTOMER,
    
    /**
     * Restaurant owner/operator who can manage their restaurant and menu.
     */
    MERCHANT,
    
    /**
     * Delivery rider who handles order deliveries.
     */
    RIDER,
    
    /**
     * Administrator with full system access.
     */
    ADMIN
}
