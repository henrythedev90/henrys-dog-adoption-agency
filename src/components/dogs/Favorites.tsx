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

export default function Favorites() {
  const dispatch = useAppDispatch();
  const {
    results: dogs,
    favorites,
    match,
    loading,
    error,
  } = useAppSelector((state: RootState) => state.dogs);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (favorites.length > 0) {
      dispatch(fetchFavoriteDogs());
    }
  }, [dispatch, favorites]);

  const handleGenerateMatch = async () => {
    if (favorites.length === 0) {
      alert("Please favorite some dogs first!");
      return;
    }
    setIsModalOpen(true);
    dispatch(fetchMatch({ favoriteIds: favorites }));
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
        <DogCarousel favoriteDogs={favoriteDogs} />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Your Perfect Match!"
        >
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
