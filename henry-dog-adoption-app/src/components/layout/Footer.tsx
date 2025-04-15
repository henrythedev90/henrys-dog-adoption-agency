import React from "react";
import classes from "./styles/Footer.module.css";
interface FooterProps {
  children: React.ReactNode;
}

export default function Footer({ children }: FooterProps) {
  return <footer className={classes.footer}>{children}</footer>;
}
