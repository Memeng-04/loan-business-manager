import type { ReactNode } from "react";

type ButtonVariant = "white" | "blue" | "outline" | "outlineWhiteText";
type ButtonSize = "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  white:
    "bg-white text-main-blue hover:opacity-90 focus-visible:ring-white focus-visible:ring-offset-main-blue",
  
  blue: "bg-main-blue text-white hover:opacity-90 focus-visible:ring-light-main-blue focus-visible:ring-offset-main-blue",
  
  outline:
    "border border-main-blue border-2 bg-transparent text-main-blue hover:bg-black/10 focus-visible:ring-white focus-visible:ring-offset-main-blue",

  outlineWhiteText:
    "border border-white border-2 bg-transparent text-white hover:bg-white/10 focus-visible:ring-white focus-visible:ring-offset-main-blue"
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "px-6 py-2.5 text-base",
  lg: "px-8 py-3 text-lg sm:px-10 sm:py-3.5 sm:text-xl",
};

export default function Button({
  children,
  onClick,
  className = "",
  variant = "white",
  size = "lg",
  type = "button",
  disabled,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`mt-10 inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}
