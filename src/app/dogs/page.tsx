"use client";
import React from "react";
import Header from "@/components/layout/Header";
import Container from "@/components/ui/Container";
import Dashboard from "@/components/dogs/Dashboard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Footer from "@/components/layout/Footer";
export default function Page() {
  return (
    <ProtectedRoute>
      <Header />
      <div
        style={{
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <Container>
          <Dashboard />
        </Container>
      </div>
      <Footer />
    </ProtectedRoute>
  );
}
