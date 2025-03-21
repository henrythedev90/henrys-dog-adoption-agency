import React from "react";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger"; // Fixed typo from 'varient' to 'variant'
  isLoading?: boolean;
  onClickFunction?: () => void;
}

const Button = ({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  onClickFunction,
  ...props
}: ButtonProps) => {
  const buttonStyles: React.CSSProperties = {
    padding: "10px 16px",
    fontSize: "16px",
    fontWeight: 600,
    borderRadius: "6px",
    border: "none",
    cursor: isLoading || props.disabled ? "not-allowed" : "pointer",
    opacity: isLoading || props.disabled ? 0.5 : 1,
    transition: "background 0.2s ease-in-out",
  };

  const variantStyle: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: "#007bff", color: "#fff" },
    secondary: { backgroundColor: "#6c757d", color: "#fff" },
    danger: { backgroundColor: "#dc3545", color: "#fff" },
  };

  return (
    <button
      {...props}
      disabled={props.disabled}
      onClick={onClickFunction}
      style={{ ...buttonStyles, ...variantStyle[variant] }}
      className={className}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};

export default Button;
