import React from "react";
import { Dog } from "@/types/dog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/store/slices/dogsSlice";
import { selectDogFavorite } from "@/store/selectors/dogsSelectors";
import Image from "next/image";

interface DogCardProps {
  dog: Dog;
}
export default function DogCard({ dog }: DogCardProps) {
  const dispatch = useAppDispatch();
  const favorite = useAppSelector(selectDogFavorite);
  const isFavorite = favorite.includes(dog.id);

  const handleFavoriteClick = () => {
    dispatch(toggleFavorite(dog.id));
  };

  return (
    <div>
      <Image src={dog.img} alt={dog.name} width={200} height={200} />
      <h2>{dog.name}</h2>
      <p>Breed: {dog.breed}</p>
      <p>Age: {dog.age}</p>
      <p>Zip Code: {dog.zipCode}</p>
      <button onClick={handleFavoriteClick}>
        {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      </button>
    </div>
  );
}
