import type { ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary";
};

export function Button({ variant = "default", style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid #ddd",
        cursor: "pointer",
        background: variant === "primary" ? "#1677ff" : "white",
        color: variant === "primary" ? "white" : "black",
        ...style,
      }}
    />
  );
}