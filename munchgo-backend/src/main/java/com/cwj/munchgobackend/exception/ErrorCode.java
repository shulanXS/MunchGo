package com.cwj.munchgobackend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Enumeration of error codes used throughout the application.
 * Each error code contains HTTP status, numeric code, and human-readable message.
 */
@Getter
public enum ErrorCode {
    
    // Authentication errors (1000-1099)
    USER_NOT_FOUND(1001, HttpStatus.NOT_FOUND, "User not found"),
    USER_ALREADY_EXISTS(1002, HttpStatus.CONFLICT, "User already exists"),
    INVALID_CREDENTIALS(1003, HttpStatus.UNAUTHORIZED, "Invalid username or password"),
    TOKEN_EXPIRED(1004, HttpStatus.UNAUTHORIZED, "Token has expired"),
    TOKEN_INVALID(1005, HttpStatus.UNAUTHORIZED, "Token is invalid"),
    UNAUTHORIZED(1006, HttpStatus.UNAUTHORIZED, "Unauthorized access"),
    
    // Authorization errors (1100-1199)
    FORBIDDEN(1101, HttpStatus.FORBIDDEN, "Access denied"),
    
    // Restaurant errors (2000-2099)
    RESTAURANT_NOT_FOUND(2001, HttpStatus.NOT_FOUND, "Restaurant not found"),
    RESTAURANT_CLOSED(2002, HttpStatus.BAD_REQUEST, "Restaurant is currently closed"),
    
    // Menu errors (2100-2199)
    MENU_ITEM_NOT_FOUND(2101, HttpStatus.NOT_FOUND, "Menu item not found"),
    CATEGORY_NOT_FOUND(2102, HttpStatus.NOT_FOUND, "Category not found"),
    INSUFFICIENT_STOCK(2103, HttpStatus.BAD_REQUEST, "Insufficient stock available"),
    
    // Order errors (2200-2299)
    ORDER_NOT_FOUND(2201, HttpStatus.NOT_FOUND, "Order not found"),
    CART_EMPTY(2202, HttpStatus.BAD_REQUEST, "Cart is empty"),
    ORDER_CANNOT_BE_CANCELLED(2203, HttpStatus.BAD_REQUEST, "Order cannot be cancelled in current status"),
    ORDER_ALREADY_ASSIGNED(2204, HttpStatus.CONFLICT, "Order has already been assigned to another rider"),
    
    // Validation errors (3000-3099)
    BAD_REQUEST(3001, HttpStatus.BAD_REQUEST, "Bad request"),
    VALIDATION_ERROR(3002, HttpStatus.BAD_REQUEST, "Validation error"),
    
    // Generic errors (9000-9099)
    NOT_FOUND(9001, HttpStatus.NOT_FOUND, "Resource not found"),
    INTERNAL_ERROR(9002, HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"),
    SERVICE_UNAVAILABLE(9003, HttpStatus.SERVICE_UNAVAILABLE, "Service temporarily unavailable");

    private final int code;
    private final HttpStatus httpStatus;
    private final String message;

    /**
     * Creates an ErrorCode with the specified code, HTTP status, and message.
     *
     * @param code the numeric error code
     * @param httpStatus the HTTP status to return
     * @param message the human-readable error message
     */
    ErrorCode(int code, HttpStatus httpStatus, String message) {
        this.code = code;
        this.httpStatus = httpStatus;
        this.message = message;
    }
}
