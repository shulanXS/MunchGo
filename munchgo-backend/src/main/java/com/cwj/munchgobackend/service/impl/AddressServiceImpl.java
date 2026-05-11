package com.cwj.munchgobackend.service.impl;

import com.cwj.munchgobackend.exception.BusinessException;
import com.cwj.munchgobackend.exception.ErrorCode;
import com.cwj.munchgobackend.model.dto.request.AddressRequest;
import com.cwj.munchgobackend.model.dto.response.AddressResponse;
import com.cwj.munchgobackend.model.entity.Address;
import com.cwj.munchgobackend.repository.AddressRepository;
import com.cwj.munchgobackend.service.interfaces.AddressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;

    @Override
    public List<AddressResponse> getByUserId(Long userId) {
        log.info("Getting addresses for user: {}", userId);
        return addressRepository.findByUserId(userId).stream()
                .map(this::toAddressResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressResponse create(Long userId, AddressRequest request) {
        log.info("Creating address for user: {}", userId);

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultForUser(userId);
        }

        Address address = Address.builder()
                .userId(userId)
                .label(request.getLabel())
                .detail(request.getDetail())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .build();

        address = addressRepository.save(address);
        log.info("Address created with id: {}", address.getId());
        return toAddressResponse(address);
    }

    @Override
    @Transactional
    public AddressResponse update(Long id, AddressRequest request, Long userId) {
        log.info("Updating address id: {} for user: {}", id, userId);

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Address not found"));

        if (!address.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only update your own addresses");
        }

        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            clearDefaultForUser(userId);
        }

        address.setLabel(request.getLabel());
        address.setDetail(request.getDetail());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());
        address.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);

        address = addressRepository.save(address);
        log.info("Address updated: {}", id);
        return toAddressResponse(address);
    }

    @Override
    @Transactional
    public void delete(Long id, Long userId) {
        log.info("Deleting address id: {} for user: {}", id, userId);

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Address not found"));

        if (!address.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only delete your own addresses");
        }

        addressRepository.delete(address);
        log.info("Address deleted: {}", id);
    }

    @Override
    @Transactional
    public void setDefault(Long id, Long userId) {
        log.info("Setting default address id: {} for user: {}", id, userId);

        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Address not found"));

        if (!address.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You can only set default for your own addresses");
        }

        clearDefaultForUser(userId);
        address.setIsDefault(true);
        addressRepository.save(address);
        log.info("Default address set: {}", id);
    }

    private void clearDefaultForUser(Long userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(address -> {
                    address.setIsDefault(false);
                    addressRepository.save(address);
                });
    }

    private AddressResponse toAddressResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .userId(address.getUserId())
                .label(address.getLabel())
                .detail(address.getDetail())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .build();
    }
}
