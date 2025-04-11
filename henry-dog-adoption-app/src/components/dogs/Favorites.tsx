"use client";
import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectDogs, selectDogFavorite } from "@/store/selectors/dogsSelectors";
import { fetchMatch, fetchFavoriteDogs } from "@/store/slices/dogsSlice";
import DogCard from "./DogCard";
import MatchScreen from "./MatchScreen";

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

  const handleOpenModal = () => {
    if (favorites.length > 0) {
      dispatch(fetchMatch(favorites));
      setIsModalOpen(true);
    }
  };

  return (
    <div>
      <h2>Your Favorite Dogs</h2>

      {favoriteDogs.length > 0 ? (
        <div>
          {favoriteDogs.map((dog: any) => {
            return <DogCard key={dog.id} dog={dog} />;
          })}
          <button onClick={handleOpenModal}>Generate Match</button>
        </div>
      ) : (
        <p>
          No favorite dogs yet. Add some dogs to your favorites to generate a
          match!
        </p>
      )}

      {isModalOpen && <MatchScreen />}
    </div>
  );
}
