import React, { forwardRef } from "react";

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`${className} rounded-sm border border-gray-400 bg-gray-700 px-2 py-1`}
        {...props}
      />
    );
  },
);

FormInput.displayName = "FormInput";

export default FormInput;
