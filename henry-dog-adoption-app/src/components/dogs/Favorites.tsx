"use client";
import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectDogs, selectDogFavorite } from "@/store/selectors/dogsSelectors";
import { fetchMatch, fetchFavoriteDogs } from "@/store/slices/dogsSlice";
import MatchScreen from "./MatchScreen";
import DogCarousel from "./DogCarousel";
import { Dog } from "@/types/dog";
import Container from "../ui/Container";
import classes from "./styles/Favorites.module.css";
export default function Favorites() {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectDogFavorite) as string[];
  const dogs = useAppSelector(selectDogs);
  const favoriteDogs = dogs.filter((dog) => favorites.includes(dog.id));
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch favorite dogs when component mounts
    if (favorites.length > 0) {
      dispatch(fetchFavoriteDogs(favorites));
    }
  }, [dispatch, favorites]);

  const handleOpenModal = (dog: Dog) => {
    if (favorites.length > 0) {
      dispatch(fetchMatch([dog.id]));
      setIsModalOpen(true);
    }
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
            handleOpenModal={handleOpenModal}
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

        {isModalOpen && <MatchScreen />}
      </div>
    </Container>
  );
}
