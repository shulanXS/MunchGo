package com.cwj.munchgobackend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {

    private Long id;

    private Long menuItemId;

    private String menuItemName;

    private String menuItemImage;

    private BigDecimal price;

    private Integer quantity;

    private BigDecimal subtotal;
}
