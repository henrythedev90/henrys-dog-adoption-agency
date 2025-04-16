"use client";
import React, { useEffect, useMemo, useState } from "react";
import classes from "./styles/Footer.module.css";
import { CONTACT_LINKS } from "../data/contactLinks";
import Link from "next/link";

export default function Footer() {
  const NA = "🌎";
  const AF = "🌍";
  const AS = "🌏";

  const globalEmoji = useMemo(() => [NA, AF, AS], []);
  const [currentEmoji, setCurrentEmoji] = useState(globalEmoji[0]);

  let i = 0;
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmoji(globalEmoji[i++ % globalEmoji.length]);
    }, 500);
    return () => clearInterval(interval);
  }, [globalEmoji, i]);
  return (
    <footer className={classes.footer}>
      <div className={classes.footer_content}>
        {CONTACT_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.devicon ? (
              <i className={link.devicon}></i>
            ) : (
              <p>{currentEmoji}</p>
            )}
          </Link>
        ))}
      </div>
    </footer>
  );
}
