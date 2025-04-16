"use client";
import React from "react";
import Favorites from "@/components/dogs/Favorites";
import Header from "@/components/layout/Header";
import Container from "@/components/ui/Container";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <Header />
      <Container>
        <Favorites />
      </Container>
    </ProtectedRoute>
  );
}
