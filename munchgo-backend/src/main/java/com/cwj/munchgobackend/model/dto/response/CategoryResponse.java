package com.cwj.munchgobackend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private Long id;

    private Long restaurantId;

    private String name;

    private Integer sortOrder;

    private Long menuItemCount;
}
