"use client";
import React from "react";
import Favorites from "@/components/dogs/Favorites";
import Header from "@/components/layout/Header";
import Container from "@/components/ui/Container";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Footer from "@/components/layout/Footer";
export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <Header />
      <Container>
        <Favorites />
      </Container>
      <Footer />
    </ProtectedRoute>
  );
}
