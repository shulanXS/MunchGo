package com.cwj.munchgobackend.repository;

import com.cwj.munchgobackend.model.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByRestaurantId(Long restaurantId, Pageable pageable);

    List<Review> findByUserId(Long userId);

    List<Review> findByOrderId(Long orderId);

    long countByRestaurantId(Long restaurantId);
}
