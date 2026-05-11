package com.cwj.munchgobackend.model.dto.request;

import com.cwj.munchgobackend.model.enums.RestaurantStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantRequest {

    @NotBlank(message = "Restaurant name is required")
    private String name;

    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    private String phone;

    private String cuisineType;

    private String imageUrl;

    @NotNull(message = "Minimum order amount is required")
    @Positive(message = "Minimum order amount must be positive")
    private BigDecimal minOrderAmount;

    @NotNull(message = "Delivery fee is required")
    @Positive(message = "Delivery fee must be positive")
    private BigDecimal deliveryFee;
}
