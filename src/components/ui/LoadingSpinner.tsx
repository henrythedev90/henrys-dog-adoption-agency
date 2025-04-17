import React from "react";
import styles from "./styles/LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "medium" }) => {
  return (
    <div className={`${styles.spinner_container} ${styles[`size_${size}`]}`}>
      <div className={styles.spinner} />
    </div>
  );
};

export default LoadingSpinner;
