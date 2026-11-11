import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router";
import "./styles.css";

type ButtonVariant = "primary" | "secondary";

type ButtonHTMLProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLink?: false;
};

type ButtonLinkProps = LinkProps & {
  isLink: true;
};

type ButtonProps = (ButtonHTMLProps | ButtonLinkProps) & {
  variant?: ButtonVariant;
  icon?: ReactNode;
  isFake?: boolean;
};

export const Button = ({
  icon,
  children,
  variant = "primary",
  className = "",
  isLink,
  isFake,
  ...props
}: ButtonProps) => {
  const content = (icon?: ReactNode, children?: ReactNode) => (
    <>
      {icon && (
        <span className="button-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </>
  );

  if (isFake) {
    return (
      <span className={`button button--${variant} ${className}`}>
        {content(icon, children)}
      </span>
    );
  }

  if (!isLink) {
    return (
      <button
        className={`button button--${variant} ${className}`}
        {...(props as ButtonHTMLProps)}
      >
        {content(icon, children)}
      </button>
    );
  }

  return (
    <Link
      className={`button button--${variant} ${className}`}
      {...(props as LinkProps)}
    >
      {content(icon, children)}
    </Link>
  );
};
