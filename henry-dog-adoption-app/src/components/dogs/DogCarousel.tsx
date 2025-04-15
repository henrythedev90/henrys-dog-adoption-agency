import React, { useState, useEffect } from "react";
import DogCard from "./DogCard";
import classes from "./styles/DogCarousel.module.css";
import { Dog } from "@/types/dog";
import Container from "../ui/Container";
import Button from "../ui/Button";

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
  const [currentSlide, setCurrentSlide] = useState(0);

  // Update current slide when favorites change
  useEffect(() => {
    // If we're at the last slide and a dog is removed, move back one slide
    if (currentSlide >= favoriteDogs.length) {
      setCurrentSlide(Math.max(0, favoriteDogs.length - 1));
    }
  }, [favoriteDogs.length, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) =>
      Math.min(prevSlide + 1, favoriteDogs.length - 1)
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => Math.max(prevSlide - 1, 0));
  };

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

        {currentSlide > 0 && (
          <Button
            onClickFunction={prevSlide}
            className={classes.carousel_button_previous}
            aria-label="Previous dog"
            variant="secondary"
          >
            ←
          </Button>
        )}

        {currentSlide < favoriteDogs.length - 1 && (
          <Button
            onClickFunction={nextSlide}
            className={classes.carousel_button_next}
            aria-label="Next dog"
            variant="secondary"
          >
            →
          </Button>
        )}

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
          <Button
            onClickFunction={() => handleOpenModal(favoriteDogs[currentSlide])}
            className={classes.generate_match_button}
          >
            Generate Match with{" "}
            {favoriteDogs[currentSlide]?.name || "Current Dog"}
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default DogCarousel;
