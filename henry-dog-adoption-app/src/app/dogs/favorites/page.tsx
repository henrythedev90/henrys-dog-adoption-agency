"use client";
import React from "react";
import Favorites from "@/components/dogs/Favorites";
import Header from "@/components/layout/Header";

export default function FavoritesPage() {
  return (
    <div>
      <Header />
      <main>
        <Favorites />
      </main>
    </div>
  );
}
