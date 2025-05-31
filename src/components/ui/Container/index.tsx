import React from "react";
import classes from "./Container.module.css";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={`${classes.container} ${className || ""}`}>{children}</div>
  );
}
