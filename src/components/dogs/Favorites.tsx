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
import Modal from "../ui/Modal";
import Image from "next/image";
export default function Favorites() {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectDogFavorite) as string[];
  const dogs = useAppSelector(selectDogs);
  const favoriteDogs = dogs.filter((dog) => favorites.includes(dog._id));

  // Keep the state and actually use it
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

  // Actually use these variables by destructuring them
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

    setMatchState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      isModalOpen: true,
    }));
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
        loading: false,
      }));
    } catch (err) {
      console.error(err);
      setMatchState((prev) => ({
        ...prev,
        error: "Failed to generate match. Please try again.",
        loading: false,
      }));
    }
  };

  // Actually use this function
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
          <DogCarousel favoriteDogs={favoriteDogs} title="Your Favorite Dogs" />
        ) : (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <h2>You do not have any favorite Dogs</h2>
            <p>
              No favorite dogs yet. Add some dogs to your favorites to generate
              a match!
            </p>
          </div>
        )}

        {/* Add the modal to use the state */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Your Perfect Match!"
        >
          <div className={classes.modal_content}>
            {loading ? (
              <p>Finding your perfect match...</p>
            ) : matchedDog ? (
              <div>
                <h3>Meet {matchedDog.name}!</h3>
                <p>Breed: {matchedDog.breed}</p>
                <p>Age: {matchedDog.age} years</p>
                {matchedDog.img && (
                  <Image
                    src={matchedDog.img}
                    alt={matchedDog.name}
                    width={300}
                    height={300}
                  />
                )}
                <button onClick={handleGenerateMatch}>Try Again</button>
              </div>
            ) : error ? (
              <div>
                <p>{error}</p>
                <button onClick={handleGenerateMatch}>Try Again</button>
              </div>
            ) : null}
          </div>
        </Modal>
      </div>
    </Container>
  );
}
