import React, { memo, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useFormik } from "formik";
import { validationSchema } from "./validation";
import FormField from "./FormField";
import { StripeError } from "@stripe/stripe-js";
import { ContinueRegistrationPageData, UserRequest } from "./types";
import "./styles.css";
import { AVATAR_TYPE_DESCRIPTIONS, AvatarType } from "../../enum/AvatarType";
import { useNavigate } from "react-router-dom";

interface RegistrationFormProps {
  onSubmit: (values: UserRequest, paymentMethodId: string) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
  success?: string;
  backendData: ContinueRegistrationPageData;
}

const ContinueRegistrationForm: React.FC<RegistrationFormProps> = memo(
  ({ onSubmit, isSubmitting, error, success, backendData }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    useEffect(() => {
      if (success) {
        const timer = setTimeout(() => {
          navigate("/users/dashboard");
        }, 3000);

        return () => clearTimeout(timer);
      }
    }, [success, navigate]);

    const handleStripeError = (
      error: StripeError,
      setFieldError: (field: string, message: string) => void
    ) => {
      switch (error.type) {
        case "card_error":
        case "validation_error":
          setFieldError(
            "submit",
            error.message || "An unexpected error occurred"
          );
          break;
        default:
          setFieldError("submit", "An unexpected error occurred");
          break;
      }
    };

    const avatarTypeOptions = Object.values(AvatarType).map((type) => ({
      value: type,
      label: type
        .split("_")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" "),
      description: AVATAR_TYPE_DESCRIPTIONS[type],
    }));

    const formik = useFormik({
      initialValues: {
        firstName: backendData.firstName || "",
        lastName: backendData.lastName || "",
        phone: backendData.phone || "",
        email: backendData.email || "", // Pre-populate email
        companyName: backendData.companyName || "", // Pre-populate company name
        avatarType: backendData.avatarType || "",
      },
      validationSchema,
      onSubmit: async (values, { setSubmitting, setFieldError }) => {
        if (!stripe || !elements) {
          setFieldError("submit", "Payment system not initialized");
          setSubmitting(false);
          return;
        }

        try {
          const result = await stripe.confirmSetup({
            elements,
            confirmParams: {},
            redirect: "if_required",
          });

          if (result.error) {
            handleStripeError(result.error, setFieldError);
            return;
          }

          if (!result.setupIntent?.payment_method) {
            setFieldError("submit", "Payment setup failed");
            return;
          }

          await onSubmit(values, result.setupIntent.payment_method as string);
        } finally {
          setSubmitting(false);
        }
      },
    });

    return (
      <div className="registration-container">
        <h1 className="registration-title">YEAH APP CONTINUE REGISTRATION</h1>
        <form onSubmit={formik.handleSubmit} className="registration-form">
          <div className="form-sections">
            {/* Customer Details Section */}
            <div className="form-section">
              <h2 className="section-title">Customer Details</h2>
              <div className="fields-container">
                <FormField
                  name="email"
                  label="Email"
                  type="email"
                  value={formik.values.email}
                  disabled={Boolean(backendData.email)}
                  required={true}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.email}
                  touched={formik.touched.email}
                />
                <FormField
                  name="companyName"
                  label="Company Name"
                  type="text"
                  value={formik.values.companyName}
                  disabled={Boolean(backendData.companyName)}
                  required={true}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.errors.companyName}
                  touched={formik.touched.companyName}
                />
                <FormField
                  name="firstName"
                  label="First Name"
                  type="text"
                  placeholder="First Name"
                  required={true}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.firstName}
                  error={formik.errors.firstName}
                  touched={formik.touched.firstName}
                />
                <FormField
                  name="lastName"
                  label="Last Name"
                  type="text"
                  placeholder="Last Name"
                  required={true}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.lastName}
                  error={formik.errors.lastName}
                  touched={formik.touched.lastName}
                />
                <FormField
                  name="phone"
                  label="Phone"
                  type="tel"
                  placeholder="Phone"
                  required={true}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phone}
                  error={formik.errors.phone}
                  touched={formik.touched.phone}
                />
                <FormField
                  name="avatarType"
                  label="Company Type"
                  type="select"
                  options={avatarTypeOptions}
                  required={true}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.avatarType}
                  error={formik.errors.avatarType}
                  touched={formik.touched.avatarType}
                />
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="form-section payment-details-section">
              <h2 className="section-title">Payment Details</h2>
              <div className="payment-container">
                <PaymentElement />
                {/* Form Actions */}
                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={!stripe || isSubmitting}
                    className="submit-button"
                  >
                    {isSubmitting ? "Processing..." : "Purchase"}
                  </button>
                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
);

export default ContinueRegistrationForm;
