import React from "react";

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  return (
    <aside>
      <h3>Filter Dogs</h3>
      {children}
    </aside>
  );
}
