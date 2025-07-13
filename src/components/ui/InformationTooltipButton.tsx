"use client";

import { JSX, useState } from "react";

type ToolTipProps = {
  text: JSX.Element;
  children: React.ReactNode;
};

export default function TooltipButton({ text, children }: ToolTipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative flex items-center">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="ml-3 cursor-pointer text-base"
      >
        {children}
      </button>

      {show && text}
    </div>
  );
}
