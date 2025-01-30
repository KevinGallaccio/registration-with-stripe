package com.wmgs.registration_backend.controller;

import com.wmgs.registration_backend.security.Response;
import com.wmgs.registration_backend.security.dto.ContinueRegistrationPageDTO;
import com.wmgs.registration_backend.service.StripeService;
import com.wmgs.registration_backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

import static java.util.Collections.emptyMap;
import static java.util.Map.of;

public class UserController {

    private final UserService userService;
    private final StripeService stripeService;

    public UserController(UserService userService, StripeService stripeService) {
        this.userService = userService;
        this.stripeService = stripeService;
    }

    @GetMapping("/get-continue-registration-page-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Response> getContinueRegistrationPageData(
            @AuthenticationPrincipal UserPrincipal userPrincipal, HttpServletRequest request) {
        try {
            ContinueRegistrationPageDTO continueRegistrationPageDTO = userService
                    .getContinueRegistrationPageData(userPrincipal.getUserId());
            if (continueRegistrationPageDTO != null) {
                return ResponseEntity.ok()
                        .body(getResponse(request, of("continueRegistrationPageData", continueRegistrationPageDTO),
                                "User and company continue registration page data retrieved successfully",
                                HttpStatus.OK));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(getResponse(request, emptyMap(), "User not found", HttpStatus.NOT_FOUND));
            }
        } catch (Exception e) {
            log.error("Error fetching continue registration page data: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(getResponse(request, emptyMap(),
                            "An error occurred while fetching continue registration page data",
                            HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping("/stripe-status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Response> checkStripeStatus(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {

        Boolean hasStripeSetup = userService.hasStripeSetup(userPrincipal.getUser().getUserId());
        Map<String, Boolean> data = Map.of("hasStripeSetup", hasStripeSetup);

        return ResponseEntity.ok()
                .body(getResponse(request, data, "Stripe status retrieved successfully.", HttpStatus.OK));
    }


    @PutMapping("/continue-registration")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Response> continueRegistration(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                         @RequestBody @Valid ContinueRegistrationRequest continueRegistrationRequest, HttpServletRequest request) {
        try {
            userService.continueUserRegistration(userPrincipal.getUser(), continueRegistrationRequest);
            return ResponseEntity.ok().body(
                    getResponse(request, emptyMap(), "User and company details updated successfully.", HttpStatus.OK));
        } catch (ApiException e) {
            return ResponseEntity.status(e.getStatus())
                    .body(getResponse(request, emptyMap(), e.getMessage(), e.getStatus()));
        }
    }
}
