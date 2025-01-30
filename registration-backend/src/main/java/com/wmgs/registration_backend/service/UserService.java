package com.wmgs.registration_backend.service;

import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;

import java.util.Optional;

public class UserService {

    @Transactional
    public void continueUserRegistration(UserDto userDto, ContinueRegistrationRequest request) {
        User user = getUserByUserId(userDto.getUserId());
        Company company = user.getCompany();

        if (company == null) {
            throw new ApiException("User has no associated company", HttpStatus.BAD_REQUEST);
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        company.setAvatarType(request.getAvatarType());

        try {
            // Create and set up Stripe customer
            Customer stripeCustomer = stripeService.createCustomer(user, company);
            if (stripeCustomer == null || stripeCustomer.getId() == null) {
                throw new ApiException("Failed to create Stripe customer", HttpStatus.BAD_REQUEST);
            }

            // Attach payment method
            stripeService.attachPaymentMethod(request.getPaymentMethodId(), stripeCustomer.getId());
            stripeService.setDefaultPaymentMethod(stripeCustomer.getId(), request.getPaymentMethodId());

            // Create subscription
            Subscription subscription = stripeService.createSubscription(
                    stripeCustomer.getId(),
                    request.getPriceId(),
                    request.getPaymentMethodId());
            if (subscription == null || subscription.getId() == null) {
                throw new ApiException("Failed to create Stripe subscription", HttpStatus.BAD_REQUEST);
            }

            // Update company with Stripe IDs
            company.setStripeCustomerId(stripeCustomer.getId());
            company.setStripeSubscriptionId(subscription.getId());

            // Save entities
            companyService.save(company);
            save(user, Optional.empty());
        } catch (StripeException e) {
            throw new ApiException("Stripe error: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException("An unexpected error occurred: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ContinueRegistrationPageDTO getContinueRegistrationPageData(Long id) {
        return userRepository.findContinueRegistrationPageData(id)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    public Boolean hasStripeSetup(String userId) {
        User user = getUserByUserId(userId);
        if (user == null || user.getCompany() == null) {
            return Boolean.FALSE;
        }
        Company company = user.getCompany();
        return company.getStripeCustomerId() != null &&
                company.getStripeSubscriptionId() != null &&
                !company.getStripeCustomerId().isEmpty() &&
                !company.getStripeSubscriptionId().isEmpty();
    }

}
