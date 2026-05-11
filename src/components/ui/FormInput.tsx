import React, { forwardRef } from "react";

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={[
          "w-full rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3.5",
          "text-[var(--ui-text)] placeholder-[var(--ui-text-subtle)]",
          "transition-all duration-200",
          "focus:border-[var(--ui-border-strong)] focus:bg-[var(--ui-surface)] focus:ring-2 focus:ring-[var(--ui-border)] focus:outline-none",
          "hover:border-[var(--ui-border-strong)]",
          className,
        ].join(" ")}
        {...props}
      />
    );
  },
);

FormInput.displayName = "FormInput";

export default FormInput;
