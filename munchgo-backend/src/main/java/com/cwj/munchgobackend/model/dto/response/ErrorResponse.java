package com.cwj.munchgobackend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standard error response format for API errors.
 * Contains error code, message, and timestamp for logging and debugging.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    /**
     * Numeric error code for programmatic handling.
     */
    private int code;

    /**
     * Human-readable error message.
     */
    private String message;

    /**
     * Timestamp when the error occurred.
     */
    private LocalDateTime timestamp;

    /**
     * Creates an ErrorResponse with code and message.
     *
     * @param code the error code
     * @param message the error message
     * @return a new ErrorResponse
     */
    public static ErrorResponse of(int code, String message) {
        return ErrorResponse.builder()
                .code(code)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Creates an ErrorResponse with code, message, and custom timestamp.
     *
     * @param code the error code
     * @param message the error message
     * @param timestamp the timestamp
     * @return a new ErrorResponse
     */
    public static ErrorResponse of(int code, String message, LocalDateTime timestamp) {
        return ErrorResponse.builder()
                .code(code)
                .message(message)
                .timestamp(timestamp)
                .build();
    }
}
