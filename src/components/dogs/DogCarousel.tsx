import React, { useState, useEffect } from "react";
import DogCard from "./DogCard";
import classes from "./styles/DogCarousel.module.css";
import modalClasses from "../ui/styles/Modal.module.css";
import { Dog } from "@/types/dog";
import Container from "../ui/Container";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectDogFavorite } from "@/store/selectors/dogsSelectors";
import { fetchMatch } from "@/store/slices/dogsSlice";
import { resetFilter } from "@/store/slices/filtersSlice";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

interface DogCarouselProps {
  favoriteDogs: Dog[];
  handleOpenModal: (dog: Dog) => void;
  title?: string;
}

const DogCarousel: React.FC<DogCarouselProps> = ({
  favoriteDogs,
  handleOpenModal,
  title = "Your Favorite Dogs",
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [matchedDog, setMatchedDog] = useState<Dog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const favoriteIds = useAppSelector(selectDogFavorite);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  // Update current slide when favorites change
  useEffect(() => {
    // If we're at the last slide and a dog is removed, move back one slide
    if (currentSlide >= favoriteDogs.length) {
      setCurrentSlide(Math.max(0, favoriteDogs.length - 1));
    }
  }, [favoriteDogs.length, currentSlide]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? favoriteDogs.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) =>
      prev === favoriteDogs.length - 1 ? 0 : prev + 1
    );
  };

  const fireConfetti = () => {
    // Fire confetti from the left edge
    confetti({
      particleCount: 100,
      spread: 120,
      origin: { x: 0, y: 0.6 },
      scalar: 1.5,
      ticks: 200,
    });

    // Fire confetti from the right edge
    confetti({
      particleCount: 100,
      spread: 120,
      origin: { x: 1, y: 0.6 },
      scalar: 1.5,
      ticks: 200,
    });
  };

  const handleGenerateMatch = async () => {
    if (favoriteIds.length === 0) {
      alert("Please favorite some dogs first!");
      return;
    }

    setLoading(true);
    setError(null);
    setIsModalOpen(true);

    try {
      const result = await dispatch(fetchMatch(favoriteIds)).unwrap();

      if (favoriteIds.length > 2) {
        // Add a delay before showing the match for better UX when there are many favorites
        setTimeout(() => {
          setMatchedDog(result);
          setLoading(false);
          fireConfetti(); // Fire confetti when the match is revealed
        }, 3000);
      } else {
        // Show match immediately if few favorites
        setMatchedDog(result);
        setLoading(false);
        fireConfetti(); // Fire confetti when the match is revealed
      }
    } catch (err: any) {
      console.error("Match error:", err);
      setError(err?.message || "Failed to generate match. Please try again.");
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    router.push("/dogs/favorites");
    dispatch(resetFilter());
    setIsModalOpen(false);
    setMatchedDog(null);
  };

  if (isNavigating) {
    return (
      <div className={classes.loading_container}>
        <LoadingSpinner size="large" />
        <p className={classes.loading_text}>
          {loading ? "Finding Match..." : "Redirecting to dashboard..."}
        </p>
      </div>
    );
  }

  // Don't render carousel if no favorites
  if (favoriteDogs.length === 0) {
    return (
      <Container>
        <div className={classes.carousel_wrapper}>
          <h2 className={classes.carousel_header}>{title}</h2>
          <p className={classes.no_favorites_message}>
            No favorite dogs yet. Add some dogs to your favorites to see them
            here!
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className={classes.carousel_wrapper}>
        {title && (
          <h2 className={classes.carousel_header}>
            {title}
            {favoriteDogs.length > 0 && (
              <span className={classes.carousel_count}>
                ({currentSlide + 1} of {favoriteDogs.length})
              </span>
            )}
          </h2>
        )}
        <div
          className={classes.carousel_slide_container}
          style={
            {
              "--slide-offset": `${-currentSlide * 100}%`,
            } as React.CSSProperties
          }
        >
          {favoriteDogs.map((dog) => (
            <div key={dog.id} className={classes.carousel_slide}>
              <div className={classes.dog_card_carousel_container}>
                <DogCard dog={dog} />
              </div>
            </div>
          ))}
        </div>

        <div className={classes.carousel_button_container}>
          <Button
            onClickFunction={handlePrevSlide}
            className={classes.carousel_button_previous}
            aria-label="Previous dog"
            variant="secondary"
            disabled={favoriteDogs.length <= 1}
          >
            ←
          </Button>

          <Button
            onClickFunction={handleGenerateMatch}
            className={classes.generate_match_button}
            disabled={loading}
          >
            {loading ? "Finding Match..." : "Generate Match"}
          </Button>

          <Button
            onClickFunction={handleNextSlide}
            className={classes.carousel_button_next}
            aria-label="Next dog"
            variant="secondary"
            disabled={favoriteDogs.length <= 1}
          >
            →
          </Button>
        </div>

        <div className={classes.carousel_button_container}>
          <div className={classes.carousel_dot}>
            {favoriteDogs.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`${classes.dot_indicator} ${
                  currentSlide === index ? classes.active : ""
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Your Perfect Match!"
      >
        <div className={modalClasses.match_modal_content}>
          {loading ? (
            <>
              <h4 className={modalClasses.match_modal_title}>
                Finding your perfect match...
              </h4>
              <div className={modalClasses.loading_container}>
                <LoadingSpinner size="large" />
                <p className={modalClasses.loading_text}>
                  Our algorithm is working its magic!
                </p>
              </div>
            </>
          ) : matchedDog ? (
            <>
              <h4 className={modalClasses.match_modal_title}>
                Meet {matchedDog.name}!
              </h4>
              <DogCard dog={matchedDog} />
              <div className={modalClasses.match_modal_actions}>
                <Button onClickFunction={handleGenerateMatch} variant="primary">
                  Try Again
                </Button>
              </div>
            </>
          ) : error ? (
            <>
              <h4 className={modalClasses.match_modal_title}>Oops!</h4>
              <p className={modalClasses.error_text}>{error}</p>
              <div className={modalClasses.match_modal_actions}>
                <Button onClickFunction={handleCloseModal} variant="secondary">
                  Close
                </Button>
                <Button onClickFunction={handleGenerateMatch} variant="primary">
                  Try Again
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </Modal>
    </Container>
  );
};

export default DogCarousel;
