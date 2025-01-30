package com.wmgs.registration_backend.service;

import org.springframework.beans.factory.annotation.Value;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.PaymentMethod;
import com.stripe.model.SetupIntent;
import com.stripe.model.Subscription;
import com.stripe.param.CustomerUpdateParams;
import com.stripe.param.PaymentMethodAttachParams;
import com.stripe.param.SetupIntentCreateParams;
import com.stripe.param.SubscriptionCreateParams;

public class StripeService {
    @Value("${stripe.api.key}")
    private String stripeApiKey;


    public void attachPaymentMethod(String paymentMethodId, String customerId) throws StripeException {
        Stripe.apiKey = stripeApiKey;
        PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);
        paymentMethod.attach(
                PaymentMethodAttachParams.builder()
                        .setCustomer(customerId)
                        .build()
        );
    }

    public void setDefaultPaymentMethod(String customerId, String paymentMethodId) throws StripeException {
        Stripe.apiKey = stripeApiKey;
        Customer customer = Customer.retrieve(customerId);
        customer.update(CustomerUpdateParams.builder()
                .setInvoiceSettings(CustomerUpdateParams.InvoiceSettings.builder()
                        .setDefaultPaymentMethod(paymentMethodId)
                        .build())
                .build()
        );
    }

    public Subscription createSubscription(String customerId, String priceId, String paymentMethodId) throws StripeException {
        Stripe.apiKey = stripeApiKey;
        SubscriptionCreateParams subscriptionParams = SubscriptionCreateParams.builder()
                .setCustomer(customerId)
                .addItem(SubscriptionCreateParams.Item.builder()
                        .setPrice(priceId)
                        .build())
                .setDefaultPaymentMethod(paymentMethodId)
                .addExpand("latest_invoice.payment_intent")
                .build();
        return Subscription.create(subscriptionParams);
    }

    public SetupIntent createSetupIntent() throws StripeException {
        Stripe.apiKey = stripeApiKey;
        SetupIntentCreateParams params = SetupIntentCreateParams.builder()
                .addPaymentMethodType("card")
                .build();
        return SetupIntent.create(params);
    }

}
