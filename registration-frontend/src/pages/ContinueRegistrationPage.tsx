import React, { useEffect, useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import ContinueRegistrationForm from "../components/continue-registration/ContinueRegistrationForm";
import ApiClient from "../network/ApiClient";
import type {
  UserRequest,
  ApiResponse,
  ContinueRegistrationPageData,
} from "../components/continue-registration/types";
import { AxiosError } from "axios";
import "../components/continue-registration/styles.css";
import { useNavigate } from "react-router-dom";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const ContinueRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [backendData, setBackendData] =
    useState<ContinueRegistrationPageData>();

  useEffect(() => {
    let isMounted = true;

    const initializeStripe = async () => {
      try {
        const response = await ApiClient.post("users/create-setup-intent");
        if (isMounted && response.data.data.clientSecret) {
          setClientSecret(response.data.data.clientSecret);
        }
      } catch (error) {
        if (isMounted && error instanceof AxiosError) {
          navigate(`/error/${error.response?.status}`);
        }
      }
    };

    const fetchContinueRegistrationPageData = async () => {
      try {
        const response = await ApiClient.get(
          "users/get-continue-registration-page-data"
        );
        if (isMounted) {
          setBackendData(response.data.data.continueRegistrationPageData);
        }
      } catch (error) {
        if (isMounted) {
          if (error instanceof AxiosError && error.response?.status === 401) {
            navigate("/error/401");
          } else {
            console.error("Failed to fetch user email and company name", error);
            setError(
              "Failed to load registration data. Please try again later."
            );
          }
        }
      }
    };

    initializeStripe();
    fetchContinueRegistrationPageData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = useCallback(
    async (values: UserRequest, paymentMethodId: string) => {
      setIsSubmitting(true);
      setError(undefined);
      setSuccess(undefined);

      try {
        const response = await ApiClient.put<ApiResponse>(
          "/users/continue-registration",
          {
            ...values,
            paymentMethodId,
            priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
          }
        );

        setSuccess(response.data.message);
      } catch (error) {
        if (error instanceof AxiosError) {
          setError(
            error.response?.data.message ||
              error.message ||
              "Registration failed. Please try again."
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  if (!clientSecret || !backendData) {
    return (
      <div className="loading-container">
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="loading-spinner" />
        )}
      </div>
    );
  }

  const stripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        fontFamily: '"Poppins", system-ui, sans-serif',
        fontWeightNormal: "400",
        borderRadius: "0",
        colorPrimary: "#FFFFFF",
        colorText: "#FFFFFF",
        colorTextPlaceholder: "#FFFFFF7D",
        colorBackground: "#010101",
      },
      rules: {
        ".Input": {
          border: "none",
          borderBottom: "2px solid #FFFFFF",
          boxShadow: "none",
          padding: "8px 0",
          backgroundColor: "#010101 !important",
        },
        ".Input:focus": {
          border: "none",
          borderBottom: "2.5px solid #FFFFFF",
          boxShadow: "none",
          backgroundColor: "#010101 !important",
        },
        ".Label": {
          fontSize: "14px",
          color: "#CBFF3C",
        },
        ".Block": {
          backgroundColor: "#010101 !important",
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={stripeElementsOptions}>
      <ContinueRegistrationForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
        success={success}
        backendData={backendData}
      />
    </Elements>
  );
};

export default ContinueRegistrationPage;
