import React, { forwardRef } from "react";

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={[
          "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5",
          "text-white/90 placeholder-white/30",
          "transition-all duration-200",
          "focus:border-white/25 focus:bg-white/8 focus:ring-2 focus:ring-white/15 focus:outline-none",
          "hover:border-white/20",
          className,
        ].join(" ")}
        {...props}
      />
    );
  },
);

FormInput.displayName = "FormInput";

export default FormInput;
