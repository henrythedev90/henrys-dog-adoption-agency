import React from "react";
import { Dog } from "@/types/dog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleFavorite } from "@/store/slices/dogsSlice";
import { selectDogFavorite } from "@/store/selectors/dogsSelectors";
import classes from "./styles/DogCard.module.css";
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
    <div
      className={classes.dog_card}
      onClick={handleFavoriteClick}
      role="button"
    >
      <div className={classes.dog_card_text}>
        <h4>{dog.name}</h4>
        <p>Breed: {dog.breed}</p>
        <p>Age: {dog.age}</p>
        {/* <p>Zip Code: {dog.zipCode}</p> */}
      </div>
      <div className={classes.dog_card_img}>
        <Image src={dog.img} alt={dog.name} width={120} height={120} />
        <div
          className={`${classes.heart_icon} ${
            isFavorite ? classes.favorite : ""
          }`}
          tabIndex={0}
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill={isFavorite ? "currentColor" : "none"}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
