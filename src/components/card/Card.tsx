import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import styles from "./Card.module.css";

export type CardVariant = "default" | "subtle" | "elevated" ;
export type CardPadding = "none" | "sm" | "md" | "lg";

type CardOwnProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  variant?: CardVariant;
  padding?: CardPadding;
};

type CardProps<T extends ElementType = "div"> = CardOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps<T>>;

export default function Card<T extends ElementType = "div">({
  as,
  children,
  className = "",
  interactive = false,
  variant = "default",
  padding = "md",
  ...rest
}: CardProps<T>) {
  const Component = as ?? "div";

  const cardClassName = [
    styles.card,
    styles[`variant${variant[0].toUpperCase()}${variant.slice(1)}`],
    styles[`padding${padding[0].toUpperCase()}${padding.slice(1)}`],
    interactive ? styles.interactive : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={cardClassName} {...rest}>
      {children}
    </Component>
  );
}
