import React from "react";
import classes from "./Container.module.css";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Container({
  children,
  className,
  style,
}: ContainerProps) {
  return (
    <div className={`${classes.container} ${className || ""}`} style={style}>
      {children}
    </div>
  );
}
