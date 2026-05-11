package com.cwj.munchgobackend.repository;

import com.cwj.munchgobackend.model.entity.Order;
import com.cwj.munchgobackend.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserId(Long userId, Pageable pageable);

    Page<Order> findByRestaurantId(Long restaurantId, Pageable pageable);

    Page<Order> findByRiderId(Long riderId, Pageable pageable);

    Optional<Order> findByOrderNo(String orderNo);

    Page<Order> findByUserIdAndStatus(Long userId, OrderStatus status, Pageable pageable);

    List<Order> findByRestaurantIdIn(List<Long> restaurantIds);

    @Query("SELECT o FROM Order o WHERE o.restaurantId IN :restaurantIds")
    Page<Order> findByRestaurantIdIn(@Param("restaurantIds") List<Long> restaurantIds, Pageable pageable);
}
