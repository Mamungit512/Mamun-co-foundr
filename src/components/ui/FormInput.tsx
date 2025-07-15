import React from "react";

type FormInputProps = {
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
};

function FormInput({
  name,
  type,
  placeholder,
  value,
  onChange,
  required,
  className,
}: FormInputProps) {
  return (
    <input
      type={type}
      name={name}
      required={required}
      className={`${className} rounded-sm border border-gray-400 bg-gray-700 px-2 py-1`}
      onChange={onChange}
      placeholder={placeholder}
      value={value}
    />
  );
}

export default FormInput;
