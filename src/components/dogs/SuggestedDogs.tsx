"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Typography } from "@mui/material";
import Container from "@/components/ui/Container";
import { apiClient } from "@/lib/apiClient";
import { Dog } from "@/types/dog";
import DogCarousel from "@/components/dogs/DogCarousel";
import DogDetailsModal from "@/components/dogs/DogDetailsModal";
import classes from "./styles/SuggestedDogs.module.css";
import { addFavorite, removeFavorite } from "@/store/slices/dogsSlice";

export default function SuggestedDogs() {
  const dispatch = useAppDispatch();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const favorite = useAppSelector((state) => state.dogs.favorites);
  const isFavorite = (dogId: string) => favorite.includes(dogId);

  useEffect(() => {
    const fetchSuggestedDogs = async () => {
      try {
        if (typeof window === "undefined") return; // Only run on client
        const preferences = localStorage.getItem("dogPreferences");
        if (!preferences) {
          setError("No preferences found. Please set your preferences first.");
          setLoading(false);
          return;
        }

        const parsedPreferences = JSON.parse(preferences);
        console.log("Sending preferences:", parsedPreferences);

        const response = await apiClient.get("/auth/user/suggested", {
          params: parsedPreferences,
        });

        console.log("Received response:", response.data);
        console.log("Number of dogs received:", response.data.length);
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

  console.log("Current dogs state:", dogs.length);

  if (loading) {
    return (
      <div>
        <Typography variant="h4">Loading your perfect matches...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Typography variant="h4" color="error">
          {error}
        </Typography>
      </div>
    );
  }

  return (
    <div>
      <Container>
        <div>
          <DogCarousel
            title="Suggested Matches"
            dogs={dogs}
            onDogClick={setSelectedDog}
            cardsPerSlide={3}
            autoNextSlide={true}
            autoNextInterval={3000}
            showDots={false}
            styles={{
              wrapperClassName: classes.suggested_dogs_carousel_wrapper,
              slideClassName: classes.suggested_dogs_carousel_slide,
            }}
            dogCardClassName={classes.suggestedDogCardMargin}
          />
          {selectedDog && (
            <DogDetailsModal
              dog={selectedDog}
              isOpen={!!selectedDog}
              onClose={() => setSelectedDog(null)}
              onToggleFavorite={(dogId: string) => {
                const isFavorite = favorite.includes(dogId);
                if (isFavorite) {
                  dispatch(removeFavorite(dogId));
                } else {
                  dispatch(addFavorite(dogId));
                }
              }}
              isFavorite={isFavorite(selectedDog._id)}
            />
          )}
        </div>
      </Container>
    </div>
  );
}
