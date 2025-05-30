import React from "react";
import DogCard from "./DogCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Dog } from "@/types/dog";
import { toggleFavorite } from "@/store/slices/dogsSlice";

interface DogListProps {
  dogIds: string[];
}
export default function DogList({ dogIds }: DogListProps) {
  const dogs = useAppSelector((state) => state.dogs.results);
  const filteredDogs = dogs.filter((dog) => dogIds.includes(dog._id));
  const dispatch = useAppDispatch();
  return (
    <div>
      {filteredDogs.map((dog: Dog) => {
        return (
          <DogCard
            key={dog._id}
            dog={dog}
            onToggleFavorite={(dogId: string) =>
              dispatch(toggleFavorite({ dogId, removeFromResults: true }))
            }
          />
        );
      })}
    </div>
  );
}
