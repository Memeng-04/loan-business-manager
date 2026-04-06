import type { ElementType, ReactNode } from "react";
import styles from "./Card.module.css";

type CardProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
};

export default function Card<T extends ElementType = "div">({
  as,
  children,
  className = "",
  interactive = false,
}: CardProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={`${styles.card} ${interactive ? styles.interactive : ""} ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
