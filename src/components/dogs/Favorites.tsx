"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import { fetchFavoriteDogs, fetchMatch } from "@/store/slices/dogsSlice";
import DogCarousel from "./DogCarousel";
import styles from "./styles/Favorites.module.css";
import Modal from "../ui/Modal";
import Image from "next/image";
import Container from "../ui/Container";
import DogDetailsModal from "./DogDetailsModal";
import Button from "../ui/Button";
import { Dog } from "@/types/dog";

export default function Favorites() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const {
    results: dogs,
    favorites,
    match,
    loading,
    error,
  } = useAppSelector((state: RootState) => state.dogs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  useEffect(() => {
    if (user) {
      dispatch(fetchFavoriteDogs());
    }
  }, [dispatch, user]);

  const handleGenerateMatch = async () => {
    if (favorites.length === 0) {
      alert("Please favorite some dogs first!");
      return;
    }
    setIsModalOpen(true);
    dispatch(fetchMatch({ favoriteIds: favorites, userId: user?._id }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (favorites.length === 0) {
    return (
      <Container>
        <div className={styles.empty_state}>
          <h2>No Favorites Yet</h2>
          <p>Add some dogs to your favorites to see them here!</p>
        </div>
      </Container>
    );
  }

  const favoriteDogs = dogs.filter((dog) => favorites.includes(dog._id));

  if (favoriteDogs.length === 0) {
    return (
      <Container>
        <div className={styles.empty_state}>
          <h2>Loading Favorites...</h2>
          <p>Please wait while we fetch your favorite dogs.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className={styles.favorites_container}>
        <div className={styles.favorites_header}>
          <h2>Your Favorite Dogs</h2>
          <Button onClickFunction={handleGenerateMatch} variant="primary">
            Generate Match
          </Button>
        </div>
        <DogCarousel
          dogs={favoriteDogs}
          onDogClick={setSelectedDog}
          styles={{
            wrapperClassName: styles.favorites_dogs_carousel_wrapper,
          }}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Your Perfect Match!"
        >
          {selectedDog && (
            <DogDetailsModal
              dog={selectedDog}
              isOpen={!!selectedDog}
              onClose={() => setSelectedDog(null)}
              onToggleFavorite={() => {}}
              isFavorite={false}
            />
          )}
          <div className={styles.modal_content}>
            {loading ? (
              <p>Finding your perfect match...</p>
            ) : match ? (
              <div className={styles.match_result}>
                <h3>Meet {match.name}!</h3>
                <p>Breed: {match.breed}</p>
                <p>Age: {match.age} years</p>
                {match.img && (
                  <Image
                    src={match.img}
                    alt={match.name}
                    width={300}
                    height={300}
                    className={styles.match_image}
                  />
                )}
                <button
                  onClick={handleGenerateMatch}
                  className={styles.try_again_button}
                >
                  Try Again
                </button>
              </div>
            ) : error ? (
              <div className={styles.error_state}>
                <p>{error}</p>
                <button
                  onClick={handleGenerateMatch}
                  className={styles.try_again_button}
                >
                  Try Again
                </button>
              </div>
            ) : null}
          </div>
        </Modal>
      </div>
    </Container>
  );
}
