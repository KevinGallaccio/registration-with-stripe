import React, { InputHTMLAttributes, ChangeEvent } from "react";
import "./styles.css";

interface FormFieldProps
  extends InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  error?: string;
  touched?: boolean;
  label?: string;
  options?: { value: string; label: string; description: string }[]; // Updated type for options
}

const FormField: React.FC<FormFieldProps> = ({
  error,
  touched,
  label,
  options,
  onChange,
  ...props
}) => {
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={props.name} className="form-label">
          {label}
        </label>
      )}
      {props.type === "select" && options ? (
        <select
          {...props}
          id={props.name}
          className="input-field"
          onChange={handleChange}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label.concat(" - ", option.description)}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...props}
          id={props.name}
          className="input-field"
          onChange={handleChange}
        />
      )}
      {touched && error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default FormField;
