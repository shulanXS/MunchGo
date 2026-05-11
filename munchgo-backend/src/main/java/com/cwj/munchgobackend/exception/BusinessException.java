package com.cwj.munchgobackend.exception;

import lombok.Getter;

/**
 * Custom runtime exception for business logic errors.
 * Wraps an ErrorCode with an optional custom message.
 */
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;
    private final String customMessage;

    /**
     * Creates a BusinessException with the specified error code.
     * Uses the default message from the error code.
     *
     * @param errorCode the error code
     */
    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.customMessage = null;
    }

    /**
     * Creates a BusinessException with the specified error code and custom message.
     * The custom message overrides the default message from the error code.
     *
     * @param errorCode the error code
     * @param customMessage the custom message to override the default
     */
    public BusinessException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.customMessage = customMessage;
    }

    /**
     * Creates a BusinessException with the specified error code and cause.
     *
     * @param errorCode the error code
     * @param cause the cause of this exception
     */
    public BusinessException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
        this.customMessage = null;
    }

    /**
     * Creates a BusinessException with the specified error code, custom message, and cause.
     *
     * @param errorCode the error code
     * @param customMessage the custom message
     * @param cause the cause of this exception
     */
    public BusinessException(ErrorCode errorCode, String customMessage, Throwable cause) {
        super(customMessage, cause);
        this.errorCode = errorCode;
        this.customMessage = customMessage;
    }

    /**
     * Gets the effective message for this exception.
     * Returns the custom message if present, otherwise the error code's default message.
     *
     * @return the effective message
     */
    @Override
    public String getMessage() {
        return customMessage != null ? customMessage : errorCode.getMessage();
    }

    /**
     * Gets the HTTP status associated with this exception's error code.
     *
     * @return the HTTP status
     */
    public int getHttpStatus() {
        return errorCode.getHttpStatus().value();
    }
}
