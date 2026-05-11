package com.cwj.munchgobackend.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    private Long cartId;

    @NotNull(message = "Delivery address ID is required")
    private Long deliveryAddressId;

    private String remark;
}
