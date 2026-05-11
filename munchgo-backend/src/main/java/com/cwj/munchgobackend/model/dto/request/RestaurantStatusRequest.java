package com.cwj.munchgobackend.model.dto.request;

import com.cwj.munchgobackend.model.enums.RestaurantStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantStatusRequest {

    @NotNull(message = "Status is required")
    private RestaurantStatus status;
}
