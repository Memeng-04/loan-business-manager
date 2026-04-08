import type { ReactNode } from "react";
import styles from "./FeedbackMessage.module.css";

type FeedbackVariant = "error" | "info" | "success";

type FeedbackMessageProps = {
  message: ReactNode;
  variant?: FeedbackVariant;
  className?: string;
};

export default function FeedbackMessage({
  message,
  variant = "error",
  className = "",
}: FeedbackMessageProps) {
  return (
    <p
      role="alert"
      data-variant={variant}
      className={`${styles.feedbackMessage} ${styles[variant]} ${className}`}
    >
      {message}
    </p>
  );
}
