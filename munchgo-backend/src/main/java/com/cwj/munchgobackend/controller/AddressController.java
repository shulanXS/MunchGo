package com.cwj.munchgobackend.controller;

import com.cwj.munchgobackend.model.dto.request.AddressRequest;
import com.cwj.munchgobackend.model.dto.response.AddressResponse;
import com.cwj.munchgobackend.model.dto.response.ApiResponse;
import com.cwj.munchgobackend.security.UserPrincipal;
import com.cwj.munchgobackend.service.interfaces.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<AddressResponse> addresses = addressService.getByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> create(
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AddressResponse response = addressService.create(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Address created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AddressResponse response = addressService.update(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        addressService.delete(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully"));
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<ApiResponse<Void>> setDefault(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        addressService.setDefault(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Default address set successfully"));
    }
}
