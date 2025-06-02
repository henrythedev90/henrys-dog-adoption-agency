"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Container from "@/components/ui/Container";
import DogCard from "@/components/dogs/DogCard";
import { apiClient } from "@/lib/apiClient";
import styles from "./suggested.module.css";
import { Dog } from "@/types/dog";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "@/components/layout/Header";
import DogCarousel from "@/components/dogs/DogCarousel";
import DogDetailsModal from "@/components/dogs/DogDetailsModal";

export default function SuggestedChoices() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);

  useEffect(() => {
    const fetchSuggestedDogs = async () => {
      try {
        const preferences = localStorage.getItem("dogPreferences");
        if (!preferences) {
          throw new Error("No preferences found");
        }

        const parsedPreferences = JSON.parse(preferences);
        console.log("Sending preferences:", parsedPreferences);

        const response = await apiClient.get("/auth/user/suggested", {
          params: parsedPreferences,
        });

        console.log("Received response:", response.data);
        setDogs(response.data);
      } catch (err) {
        console.error("Error fetching suggested dogs:", err);
        setError("Failed to load suggested dogs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedDogs();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <Typography variant="h4">Loading your perfect matches...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Typography variant="h4" color="error">
          {error}
        </Typography>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Header />
      <div className={styles.page}>
        <Container>
          <div className={styles.container}>
            <DogCarousel
              title="Your Perfect Matches"
              dogs={dogs}
              onDogClick={setSelectedDog}
            />
            {selectedDog && (
              <DogDetailsModal
                dog={selectedDog}
                isOpen={!!selectedDog}
                onClose={() => setSelectedDog(null)}
                onToggleFavorite={() => {}}
                isFavorite={false}
              />
            )}
          </div>
        </Container>
      </div>
    </ProtectedRoute>
  );
}
