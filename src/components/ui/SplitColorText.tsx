import React from "react";
import styles from "./styles/SplitColorText.module.css";

type AllowedTags = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

interface SplitColorTextProps {
  text: string;
  className?: string;
  tag?: AllowedTags;
  size?: "small" | "medium" | "large";
}

const SplitColorText: React.FC<SplitColorTextProps> = ({
  text,
  className = "",
  tag = "h3",
  size = "medium",
}) => {
  const Tag = tag;
  const sizeClass = styles[`size_${size}`];

  return (
    <Tag className={`${styles.split_text} ${sizeClass} ${className}`}>
      {text.split("").map((letter, index) => (
        <span key={index} className={styles.letter}>
          {letter}
        </span>
      ))}
    </Tag>
  );
};

export default SplitColorText;
