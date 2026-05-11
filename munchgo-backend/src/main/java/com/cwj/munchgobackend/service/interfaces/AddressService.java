package com.cwj.munchgobackend.service.interfaces;

import com.cwj.munchgobackend.model.dto.request.AddressRequest;
import com.cwj.munchgobackend.model.dto.response.AddressResponse;

import java.util.List;

public interface AddressService {

    List<AddressResponse> getByUserId(Long userId);

    AddressResponse create(Long userId, AddressRequest request);

    AddressResponse update(Long id, AddressRequest request, Long userId);

    void delete(Long id, Long userId);

    void setDefault(Long id, Long userId);
}
