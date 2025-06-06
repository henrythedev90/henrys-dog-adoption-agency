import React from "react";
import { Dog } from "@/types/dog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addFavorite, removeFavorite } from "@/store/slices/dogsSlice";
import { selectDogFavorite } from "@/store/selectors/dogsSelectors";
import classes from "./styles/DogCard.module.css";
import DogCardImage from "./DogCardImage";

interface DogCardProps {
  dog: Dog;
  onToggleFavorite?: (dogId: string) => void;
  onClick?: (dog: Dog) => void;
  className?: string;
}

const DogCard = React.memo(
  ({ dog, onClick, onToggleFavorite, className }: DogCardProps) => {
    const dispatch = useAppDispatch();
    const favorite = useAppSelector(selectDogFavorite);
    const isFavorite = favorite.includes(dog._id);

    const handleFavoriteClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isFavorite) {
        dispatch(removeFavorite(dog._id));
      } else {
        dispatch(addFavorite(dog._id));
      }
    };

    const handleCardClick = () => {
      onClick?.(dog);
    };

    return (
      <div
        className={`${classes.dog_card} ${className || ""}`}
        style={{
          background: "white",
        }}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleCardClick();
          }
        }}
      >
        <div className={classes.dog_card_img}>
          <DogCardImage urlImage={dog.img} title={dog.name} />
        </div>
        <div className={classes.dog_card_text}>
          <h3>{dog.name}</h3>

          <p>
            <label>Age:</label>
            {dog.age}
          </p>
          <p>
            <label>Gender:</label>
            {dog.gender}
          </p>
          <p>
            <label>Borough:</label>
            {typeof dog.borough === "string"
              ? dog.borough
                  .replace(/_/g, " ")
                  .trim()
                  .split(/\s+/)
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ")
              : ""}
          </p>
          <p>
            <label>Zip Code:</label>
            {dog.zip_code}
          </p>

          <p>
            <label>Breed:</label>
            {dog.breed}
          </p>
        </div>
        <div
          className={`${classes.heart_icon} ${
            isFavorite ? classes.favorite : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onToggleFavorite) {
              onToggleFavorite(dog._id);
            } else {
              handleFavoriteClick(e);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
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
    );
  }
);

DogCard.displayName = "DogCard";

export default DogCard;
