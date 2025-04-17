"use client";
import React from "react";
import Header from "@/components/layout/Header";
import Container from "@/components/ui/Container";
import Dashboard from "@/components/dogs/Dashboard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <Header />
      <Container>
        <Dashboard />
      </Container>
    </ProtectedRoute>
  );
}
