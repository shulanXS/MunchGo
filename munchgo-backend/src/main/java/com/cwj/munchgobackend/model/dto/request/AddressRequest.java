package com.cwj.munchgobackend.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {

    @NotBlank(message = "Label is required")
    private String label;

    @NotBlank(message = "Detail is required")
    private String detail;

    private BigDecimal latitude;

    private BigDecimal longitude;

    @Builder.Default
    private Boolean isDefault = false;
}
