import React from "react";
import { Dog } from "@/types/dog";
import DogCard from "./DogCard";
import { useAppSelector } from "@/store/hooks";

interface DogListProps {
  dogIds: string[];
}
export default function DogList({ dogIds }: DogListProps) {
  const dogs = useAppSelector((state) => state.dogs.results);
  const filteredDogs = dogs.filter((dog) => dogIds.includes(dog.id));

  return (
    <div>
      {filteredDogs.map((dog: any) => {
        return <DogCard key={dog.id} dog={dog} />;
      })}
    </div>
  );
}
