import React, { useState } from "react";
import { Dog } from "@/types/dog";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import classes from "./styles/DogDetailsModal.module.css";
import Image from "next/image";

interface DogDetailsModalProps {
  dog: Dog;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (dogId: string) => void;
  isFavorite: boolean;
}

const DogDetailsModal: React.FC<DogDetailsModalProps> = ({
  dog,
  isOpen,
  onClose,
  onToggleFavorite,
  isFavorite,
}) => {
  const formatBorough = (borough: string) => {
    return borough
      .replace(/_/g, " ")
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const [traitsOpen, setTraitsOpen] = useState(false);

  return (
    <Modal
      style={{
        maxWidth: "min(750px, 90vw)",
        maxHeight: "78vh",
        width: "100%",
        padding: 0,
        overflow: "auto",
      }}
      isOpen={isOpen}
      // onClose={onClose}
      // title={`Meet ${dog.name}!`}
    >
      <div className={classes.modal_content}>
        <div className={classes.header}>
          <div className={classes.actions}>
            <Button onClickFunction={onClose} variant="secondary">
              Close
            </Button>
          </div>
          <h2>{dog.name}</h2>
          <button
            className={`${classes.heart_icon} ${
              isFavorite ? classes.favorite : ""
            }`}
            onClick={() => onToggleFavorite(dog._id)}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
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
          </button>
        </div>

        <div className={classes.details_container}>
          <div className={classes.image_container}>
            <Image
              src={dog.img}
              alt={dog.name}
              className={classes.dog_image}
              width={300}
              height={300}
              priority
            />
          </div>

          <div className={classes.info_grid}>
            <div className={classes.info_item}>
              <label>Age:</label>
              <span>{dog.age} years</span>
            </div>
            <div className={classes.info_item}>
              <label>Gender:</label>
              <span>{dog.gender}</span>
            </div>
            <div className={classes.info_item}>
              <label>Breed</label>
              <span>{dog.breed}</span>
            </div>
            <div className={classes.info_item}>
              <label>Borough:</label>
              <span>{formatBorough(dog.borough)}</span>
            </div>
            <div className={classes.info_item}>
              <label>Zip Code:</label>
              <span>{dog.zip_code}</span>
            </div>
          </div>

          {/* Traits & Personality Dropdown */}
          <div className={classes.traits_section}>
            <button
              className={classes.traits_toggle}
              style={{
                borderBottom: traitsOpen
                  ? "2px solid var(--foreground)"
                  : "none",
              }}
              onClick={() => setTraitsOpen((open) => !open)}
              aria-expanded={traitsOpen}
              aria-controls="traits-content"
              type="button"
            >
              Traits & Personality
              <span
                className={traitsOpen ? classes.arrow_up : classes.arrow_down}
              />
            </button>
            {traitsOpen && (
              <div className={classes.traits_grid} id="traits-content">
                <div className={classes.trait_item}>
                  <label>Good with Dogs</label>
                  <span>{dog.good_with_other_dogs ? "Yes" : "No"}</span>
                </div>
                <div className={classes.trait_item}>
                  <label>Good with Cats</label>
                  <span>{dog.good_with_other_animals ? "Yes" : "No"}</span>
                </div>
                <div className={classes.trait_item}>
                  <label>Good with Kids</label>
                  <span>{dog.good_with_children ? "Yes" : "No"}</span>
                </div>
                <div className={classes.trait_item}>
                  <label>Good with Strangers</label>
                  <span>{dog.good_with_strangers ? "Yes" : "No"}</span>
                </div>
                <div className={classes.trait_item}>
                  <label>Energy Level</label>
                  <span>{dog.energy_level}</span>
                </div>
                <div className={classes.trait_item}>
                  <label>Barking Level</label>
                  <span>{dog.barking_level}</span>
                </div>
                <div className={classes.trait_item}>
                  <label>Shedding Level</label>
                  <span>{dog.shedding_level}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DogDetailsModal;
