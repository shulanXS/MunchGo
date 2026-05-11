package com.cwj.munchgobackend.repository;

import com.cwj.munchgobackend.model.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByRestaurantIdOrderBySortOrderAsc(Long restaurantId);

    boolean existsByIdAndRestaurantId(Long id, Long restaurantId);
}
