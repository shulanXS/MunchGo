package com.cwj.munchgobackend.model.dto.response;

import com.cwj.munchgobackend.exception.ErrorCode;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic API response wrapper for consistent response format.
 * Contains success status, message, data payload, and error information.
 *
 * @param <T> the type of the data payload
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    /**
     * Indicates whether the request was successful.
     */
    private boolean success;

    /**
     * Human-readable message about the response.
     */
    private String message;

    /**
     * The data payload (null on error).
     */
    private T data;

    /**
     * Error information (present only on failure).
     */
    private ErrorResponse error;

    /**
     * Creates a successful response with data.
     *
     * @param data the data to include in the response
     * @param <T> the type of the data
     * @return a successful ApiResponse
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    /**
     * Creates a successful response with message and data.
     *
     * @param message the success message
     * @param data the data to include in the response
     * @param <T> the type of the data
     * @return a successful ApiResponse
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    /**
     * Creates a successful response with only a message.
     *
     * @param message the success message
     * @param <T> the type placeholder
     * @return a successful ApiResponse
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .build();
    }

    /**
     * Creates an error response from an ErrorCode.
     *
     * @param errorCode the error code
     * @param <T> the type placeholder
     * @return an error ApiResponse
     */
    public static <T> ApiResponse<T> error(ErrorCode errorCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(ErrorResponse.of(errorCode.getCode(), errorCode.getMessage()))
                .build();
    }

    /**
     * Creates an error response with custom message.
     *
     * @param errorCode the error code
     * @param message the custom error message
     * @param <T> the type placeholder
     * @return an error ApiResponse
     */
    public static <T> ApiResponse<T> error(ErrorCode errorCode, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(ErrorResponse.of(errorCode.getCode(), message))
                .build();
    }
}
