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
import {
  clearFavorite,
  fetchMatch,
  toggleFavorite,
} from "@/store/slices/dogsSlice";
import { resetFilter } from "@/store/slices/filtersSlice";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

interface CarouselControls {
  showNavigation?: boolean;
  showDots?: boolean;
  showMatchButton?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  transitionSpeed?: number;
}

interface CarouselStyles {
  wrapperClassName?: string;
  headerClassName?: string;
  slideClassName?: string;
  navigationClassName?: string;
  dotClassName?: string;
  matchButtonClassName?: string;
}

interface CarouselCallbacks {
  onSlideChange?: (index: number) => void;
  onMatchGenerate?: (dogs: Dog[]) => Promise<void>;
  onDogAction?: (dog: Dog) => void;
}

interface DogCarouselProps {
  dogs: Dog[];
  title?: string;
  controls?: CarouselControls;
  styles?: CarouselStyles;
  callbacks?: CarouselCallbacks;
  renderCustomHeader?: (props: {
    currentSlide: number;
    totalSlides: number;
  }) => React.ReactNode;
  renderCustomSlide?: (props: { dog: Dog; index: number }) => React.ReactNode;
  renderCustomFooter?: () => React.ReactNode;
  onDogClick?: (dog: Dog) => void;
  cardsPerSlide?: number;
  dogCardClassName?: string;
}

const defaultControls: CarouselControls = {
  showNavigation: true,
  showDots: true,
  showMatchButton: false,
  autoPlay: false,
  autoPlayInterval: 5000,
  transitionSpeed: 500,
};

const DogCarousel: React.FC<DogCarouselProps> = ({
  dogs,
  title,
  controls = defaultControls,

  styles = {},
  callbacks = {},
  renderCustomHeader,
  renderCustomSlide,
  renderCustomFooter,
  onDogClick,
  cardsPerSlide = 1,
  dogCardClassName,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [matchedDog, setMatchedDog] = useState<Dog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | React.ReactNode | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const favoriteIds = useAppSelector(selectDogFavorite);
  const { user } = useAppSelector((state) => state.auth);

  // Calculate total number of slides based on cardsPerSlide
  const totalSlides = Math.ceil(dogs.length / cardsPerSlide);

  // Auto-play functionality
  useEffect(() => {
    if (!controls.autoPlay || dogs.length <= 1) return;

    const interval = setInterval(() => {
      handleNextSlide();
    }, controls.autoPlayInterval);

    return () => clearInterval(interval);
  }, [controls.autoPlay, controls.autoPlayInterval, currentSlide, dogs.length]);

  // Update current slide when dogs change
  useEffect(() => {
    if (dogs.length === 0) return;

    if (currentSlide >= dogs.length) {
      setIsTransitioning(true);
      setCurrentSlide(Math.max(0, dogs.length - 1));
      setTimeout(() => setIsTransitioning(false), controls.transitionSpeed);
    }
  }, [dogs.length, currentSlide, controls.transitionSpeed]);

  // Clamp currentSlide to valid range when totalSlides changes
  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(Math.max(0, totalSlides - 1));
    }
  }, [totalSlides, currentSlide]);

  const handlePrevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), controls.transitionSpeed);
    callbacks.onSlideChange?.(currentSlide);
  };

  const handleNextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), controls.transitionSpeed);
    callbacks.onSlideChange?.(currentSlide);
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 120,
      origin: { x: 0, y: 0.6 },
      scalar: 1.5,
      ticks: 200,
    });
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
      if (callbacks.onMatchGenerate) {
        await callbacks.onMatchGenerate(dogs);
      } else {
        const result = await dispatch(
          fetchMatch({ favoriteIds, userId: user?._id })
        ).unwrap();

        if ("allMatched" in result) {
          setError(
            <div className={modalClasses.error_container}>
              <p>{result.message}</p>
              <p className={modalClasses.suggestion_text}>
                Head to the Dashboard to discover more amazing dogs!
              </p>
              <div className={modalClasses.match_modal_actions}>
                <Button
                  onClickFunction={() => {
                    router.push("/dogs");
                    dispatch(clearFavorite());
                  }}
                  variant="primary"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          );
          setLoading(false);
          return;
        }

        setMatchedDog(result);
        fireConfetti();
      }
    } catch (err: unknown) {
      console.error("Match error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate match. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMatchedDog(null);
    dispatch(resetFilter());
  };

  // Helper to always provide a function for onClick
  const handleDogClick = onDogClick || callbacks.onDogAction || (() => {});

  // Don't render carousel if no dogs
  if (dogs.length === 0) {
    return (
      <Container>
        <div
          className={`${classes.carousel_wrapper} ${
            styles.wrapperClassName || ""
          }`}
        >
          <h2
            className={`${classes.carousel_header} ${
              styles.headerClassName || ""
            }`}
          >
            {title}
          </h2>
          <p className={classes.no_favorites_message}>
            No dogs available to display.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div
        className={`${classes.carousel_wrapper} ${
          styles.wrapperClassName || ""
        }`}
      >
        {renderCustomHeader
          ? renderCustomHeader({ currentSlide, totalSlides })
          : title && (
              <h2
                className={`${classes.carousel_header} ${
                  styles.headerClassName || ""
                }`}
              >
                {title}
                {totalSlides > 0 && (
                  <span className={classes.carousel_count}>
                    ({currentSlide + 1} of {totalSlides})
                  </span>
                )}
              </h2>
            )}

        <div
          className={`${classes.carousel_slide_container} ${
            isTransitioning ? classes.transitioning : ""
          } ${styles.slideClassName || ""}`}
          style={
            {
              "--slide-offset": `${-currentSlide * 100}%`,
              "--slides-per-view": cardsPerSlide,
            } as React.CSSProperties
          }
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => {
            const startIndex = slideIndex * cardsPerSlide;
            const endIndex = Math.min(startIndex + cardsPerSlide, dogs.length);
            const slideDogs = dogs.slice(startIndex, endIndex);
            return (
              <div key={slideIndex} className={classes.carousel_slide}>
                <div
                  className={`${classes.dog_card_carousel_container} ${
                    styles.slideClassName || ""
                  }`}
                >
                  {slideDogs.map((dog, index) =>
                    renderCustomSlide ? (
                      renderCustomSlide({ dog, index: startIndex + index })
                    ) : (
                      <DogCard
                        key={dog._id}
                        dog={dog}
                        className={dogCardClassName}
                        onToggleFavorite={(dogId: string) =>
                          dispatch(
                            toggleFavorite({ dogId, removeFromResults: true })
                          )
                        }
                        onClick={handleDogClick}
                      />
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className={`${classes.carousel_button_container} ${
            styles.navigationClassName || ""
          }`}
        >
          {controls.showNavigation && (
            <>
              <Button
                onClickFunction={handlePrevSlide}
                className={classes.carousel_button_previous}
                aria-label="Previous slide"
                variant="secondary"
                disabled={totalSlides <= 1 || isTransitioning}
              >
                ←
              </Button>

              {controls.showMatchButton && (
                <Button
                  onClickFunction={handleGenerateMatch}
                  className={`${classes.generate_match_button} ${
                    styles.matchButtonClassName || ""
                  }`}
                  disabled={loading || isTransitioning}
                >
                  {loading ? "Finding Match..." : "Generate Match"}
                </Button>
              )}

              <Button
                onClickFunction={handleNextSlide}
                className={classes.carousel_button_next}
                aria-label="Next slide"
                variant="secondary"
                disabled={totalSlides <= 1 || isTransitioning}
              >
                →
              </Button>
            </>
          )}
        </div>

        {controls.showDots && (
          <div
            className={`${classes.carousel_button_container} ${
              styles.dotClassName || ""
            }`}
          >
            <div className={classes.carousel_dot}>
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsTransitioning(true);
                    setCurrentSlide(index);
                    setTimeout(
                      () => setIsTransitioning(false),
                      controls.transitionSpeed
                    );
                    callbacks.onSlideChange?.(index);
                  }}
                  className={`${classes.dot_indicator} ${
                    currentSlide === index ? classes.active : ""
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  disabled={isTransitioning}
                />
              ))}
            </div>
          </div>
        )}

        {renderCustomFooter && renderCustomFooter()}
      </div>

      {controls.showMatchButton && (
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
                <DogCard
                  dog={matchedDog}
                  className={dogCardClassName}
                  onToggleFavorite={(dogId: string) =>
                    dispatch(toggleFavorite({ dogId, removeFromResults: true }))
                  }
                  onClick={() => {}}
                />
                <div className={modalClasses.match_modal_actions}>
                  <Button
                    onClickFunction={handleGenerateMatch}
                    variant="primary"
                  >
                    Try Again
                  </Button>
                </div>
              </>
            ) : error ? (
              <>
                <h4 className={modalClasses.match_modal_title}>Oops!</h4>
                <p className={modalClasses.error_text}>{error}</p>
                <div className={modalClasses.match_modal_actions}>
                  <Button
                    onClickFunction={handleCloseModal}
                    variant="secondary"
                  >
                    Close
                  </Button>
                  <Button
                    onClickFunction={handleGenerateMatch}
                    variant="primary"
                  >
                    Try Again
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </Modal>
      )}
    </Container>
  );
};

export default DogCarousel;
