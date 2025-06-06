import React from "react";
import DogCard from "./DogCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Dog } from "@/types/dog";
import { addFavorite, removeFavorite } from "@/store/slices/dogsSlice";

interface DogListProps {
  dogIds: string[];
}
export default function DogList({ dogIds }: DogListProps) {
  const dogs = useAppSelector((state) => state.dogs.results);
  const favorites = useAppSelector((state) => state.dogs.favorites);
  const filteredDogs = dogs.filter((dog) => dogIds.includes(dog._id));
  const dispatch = useAppDispatch();

  const handleToggleFavorite = (dogId: string) => {
    if (favorites.includes(dogId)) {
      dispatch(removeFavorite(dogId));
    } else {
      dispatch(addFavorite(dogId));
    }
  };
  return (
    <div>
      {filteredDogs.map((dog: Dog) => {
        return (
          <DogCard
            key={dog._id}
            dog={dog}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      })}
    </div>
  );
}
