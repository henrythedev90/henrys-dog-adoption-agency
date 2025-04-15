"use client";
import React from "react";
import Favorites from "@/components/dogs/Favorites";
import Header from "@/components/layout/Header";
import Container from "@/components/ui/Container";

export default function FavoritesPage() {
  return (
    <div>
      <Header />
      <Container>
        <Favorites />
      </Container>
    </div>
  );
}
