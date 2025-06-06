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
import Link from "next/link";
import { fireConfetti } from "@/utils/fireConfetti";

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
    try {
      const result = await dispatch(
        fetchMatch({ favoriteIds: favorites, userId: user?._id })
      );
      if (result && result.payload) {
        console.log("THIS IS result", result);
        fireConfetti();
      }
    } catch (error) {
      console.error("Error generating match:", error);
    }
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
          <Link href="/dogs" className={styles.back_link}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Home
          </Link>
          <h2 className={styles.favorites_title}>Your Favorite Dogs</h2>
          <p className={styles.favorites_count}>
            {favoriteDogs.length} {favoriteDogs.length === 1 ? "dog" : "dogs"}{" "}
            in your favorites
          </p>

          <div className={styles.favorites_actions}>
            <Button onClickFunction={handleGenerateMatch} variant="primary">
              Generate Match
            </Button>
          </div>
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
          <div className={styles.modal_content}>
            {loading ? (
              <div className={styles.loading_state}>
                <p>Finding your perfect match...</p>
              </div>
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
                <Button
                  onClickFunction={handleGenerateMatch}
                  variant="secondary"
                >
                  Try Again
                </Button>
              </div>
            ) : error ? (
              <div className={styles.error_state}>
                <p>{error}</p>
                <Button
                  onClickFunction={handleGenerateMatch}
                  variant="secondary"
                >
                  Try Again
                </Button>
              </div>
            ) : null}
          </div>
        </Modal>
      </div>
      {selectedDog && (
        <DogDetailsModal
          dog={selectedDog}
          isOpen={!!selectedDog}
          onClose={() => setSelectedDog(null)}
          onToggleFavorite={() => {}}
          isFavorite={false}
        />
      )}
    </Container>
  );
}
