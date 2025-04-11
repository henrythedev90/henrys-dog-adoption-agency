"use client";
import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectDogs, selectDogFavorite } from "@/store/selectors/dogsSelectors";
import { fetchMatch } from "@/store/slices/dogsSlice";
import MatchScreen from "./MatchScreen";

export default function Favorites() {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectDogFavorite) as string[];
  const dogs = useAppSelector(selectDogs);
  const favoriteDogs = dogs.filter((dog) => favorites.includes(dog.id));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (favorites.length > 0) {
      dispatch(fetchMatch(favorites));
      setIsModalOpen(true);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Favorite Dogs</h2>

      {favoriteDogs.length > 0 ? (
        <div className="space-y-4">
          <ul className="space-y-2">
            {favoriteDogs.map((dog) => (
              <li key={dog.id} className="p-2 bg-white rounded shadow">
                {dog.name} - {dog.breed}
              </li>
            ))}
          </ul>
          <button
            onClick={handleOpenModal}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Generate Match
          </button>
        </div>
      ) : (
        <p className="text-gray-600">
          No favorite dogs yet. Add some dogs to your favorites to generate a
          match!
        </p>
      )}

      {isModalOpen && <MatchScreen />}
    </div>
  );
}
