"use client";
import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectDogs, selectDogFavorite } from "@/store/selectors/dogsSelectors";
import { fetchFavoriteDogs } from "@/store/slices/dogsSlice";
import DogCarousel from "./DogCarousel";
import { Dog } from "@/types/dog";
import Container from "../ui/Container";
import classes from "./styles/Favorites.module.css";
import { apiClient } from "@/lib/apiClient";

export default function Favorites() {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectDogFavorite) as string[];
  const dogs = useAppSelector(selectDogs);
  const favoriteDogs = dogs.filter((dog) => favorites.includes(dog.id));
  const [matchState, setMatchState] = useState<{
    isModalOpen: boolean;
    matchedDog: Dog | null;
    loading: boolean;
    error: string | null;
  }>({
    isModalOpen: false,
    matchedDog: null,
    loading: false,
    error: null,
  });

  const { isModalOpen, matchedDog, loading, error } = matchState;

  useEffect(() => {
    // Fetch favorite dogs when component mounts
    if (favorites.length > 0) {
      dispatch(fetchFavoriteDogs(favorites));
    }
  }, [dispatch, favorites]);

  const handleGenerateMatch = async () => {
    if (favorites.length === 0) {
      alert("Please favorite some dogs first!");
      return;
    }

    setMatchState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const matchResponse = await apiClient.post("/dogs/match", favorites, {
        withCredentials: true,
      });
      const matchId = matchResponse.data.match;

      const dogResponse = await apiClient.post("/dogs", [matchId], {
        withCredentials: true,
      });
      setMatchState((prev) => ({
        ...prev,
        matchedDog: dogResponse.data[0],
        isModalOpen: true,
      }));
    } catch (err) {
      console.error(err);
      setMatchState((prev) => ({
        ...prev,
        error: "Failed to generate match. Please try again.",
      }));
    } finally {
      setMatchState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCloseModal = () => {
    setMatchState((prev) => ({
      ...prev,
      isModalOpen: false,
      matchedDog: null,
    }));
  };

  return (
    <Container>
      <div
        className={
          favoriteDogs.length === 0
            ? classes.carousel_parent_wrapper
            : undefined
        }
      >
        {favoriteDogs.length > 0 ? (
          <DogCarousel
            favoriteDogs={favoriteDogs}
            handleOpenModal={handleGenerateMatch}
            title="Your Favorite Dogs"
          />
        ) : (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            {favoriteDogs.length > 0 ? (
              <h2>Your Favorite Dogs</h2>
            ) : (
              <h2>You do not have any favorite Dogs</h2>
            )}
            <p>
              No favorite dogs yet. Add some dogs to your favorites to generate
              a match!
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}
