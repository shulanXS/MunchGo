package com.cwj.munchgobackend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {

    private Long id;

    private Long userId;

    private String label;

    private String detail;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private Boolean isDefault;

    private LocalDateTime createdAt;
}
