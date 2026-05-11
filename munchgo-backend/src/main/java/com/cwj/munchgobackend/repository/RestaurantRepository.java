package com.cwj.munchgobackend.repository;

import com.cwj.munchgobackend.model.entity.Restaurant;
import com.cwj.munchgobackend.model.enums.RestaurantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    Page<Restaurant> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Restaurant> findByStatus(RestaurantStatus status, Pageable pageable);

    List<Restaurant> findByUserId(Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    Page<Restaurant> findByNameContainingIgnoreCaseAndStatus(String name, RestaurantStatus status, Pageable pageable);
}
