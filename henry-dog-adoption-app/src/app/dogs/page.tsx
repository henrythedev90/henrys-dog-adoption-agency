"use client";
import React from "react";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

import Dashboard from "@/components/dogs/Dashboard";

export default function page() {
  return (
    <div>
      <Header />

      <Dashboard />

      <Footer>hello world</Footer>
    </div>
  );
}
