"use client";
import React, { Component, ReactNode } from "react";

interface SplitTextProps {
  copy: string;
  role?: string;
}

class SplitText extends Component<SplitTextProps> {
  render(): ReactNode {
    const { copy, role } = this.props;

    return (
      <span aria-label={copy} role={role}>
        {copy.split("").map((char, index) => {
          const style = { animationDelay: 0.5 + index / 10 + "s" };
          return (
            <span aria-hidden="true" key={index} style={style}>
              {char}
            </span>
          );
        })}
      </span>
    );
  }
}

export default SplitText;
