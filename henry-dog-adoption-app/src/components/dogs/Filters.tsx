"use client";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBreeds } from "../../store/slices/breedSlice";
import { selectFilters } from "../../store/selectors/filterSelectors";
import classes from "./styles/Filters.module.css";
import {
  setFilters,
  resetFilter,
  PAGE_SIZES,
} from "../../store/slices/filtersSlice";
import {
  selectBreeds,
  selectBreedsLoading,
  selectBreedsError,
} from "../../store/selectors/breedSelectors";
import Button from "../ui/Button";

export default function Filters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const breeds = useAppSelector(selectBreeds);
  const loadingBreeds = useAppSelector(selectBreedsLoading);
  const breedsError = useAppSelector(selectBreedsError);
  const [zipInput, setZipInput] = useState("");

  useEffect(() => {
    dispatch(fetchBreeds());
  }, [dispatch]);

  const handleBreedsSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBreed = e.target.value;
    if (selectedBreed && !filters.breeds.includes(selectedBreed)) {
      dispatch(setFilters({ breeds: [...filters.breeds, selectedBreed] }));
    }
  };

  const handleRemoveBreed = (breedToRemove: string) => {
    dispatch(
      setFilters({
        breeds: filters.breeds.filter((breed) => breed !== breedToRemove),
      })
    );
  };

  const handleZipCodes = () => {
    const trimmedZip = zipInput.trim();
    if (/^\d{5}$/.test(trimmedZip) && !filters.zipCodes.includes(trimmedZip)) {
      // Basic Zip Validation
      dispatch(setFilters({ zipCodes: [...filters.zipCodes, trimmedZip] }));
      setZipInput(""); // Clear input after valid entry
    } else {
      alert("Please enter a valid 5-digit ZIP code.");
      setZipInput("");
    }
  };

  const removeZip = (zip: string) => {
    dispatch(
      setFilters({ zipCodes: filters.zipCodes.filter((z) => z !== zip) })
    );
  };

  const handleAgeMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 0) {
      alert("Please enter a non-negative number for Min Age.");
      return;
    }
    dispatch(setFilters({ ageMin: value }));
  };

  const handleAgeMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 0) {
      alert("Please enter a non-negative number for Max Age.");
      return;
    }
    dispatch(setFilters({ ageMax: value }));
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = parseInt(e.target.value) as (typeof PAGE_SIZES)[number];
    dispatch(setFilters({ size }));
  };

  return (
    <div className={classes.filter_container}>
      <div className={classes.filter_breed_container}>
        <label>Breed:</label>
        <select onChange={handleBreedsSelect} value="">
          <option value="" disabled>
            Select a breed
          </option>
          {loadingBreeds ? (
            <option>Loading breeds...</option>
          ) : breedsError ? (
            <option>Error loading breeds.</option>
          ) : (
            breeds.map((breed: string) => (
              <option key={breed} value={breed}>
                {breed}
              </option>
            ))
          )}
        </select>
      </div>

      <div className={classes.filter_zipCode_container}>
        <label>ZIP Codes:</label>
        <div className={classes.filter_zipCode_input}>
          <input
            type="text"
            placeholder="Enter ZIP Codes"
            value={zipInput}
            onChange={(e) => setZipInput(e.target.value)}
          />
          <Button
            type="button"
            disabled={zipInput.length > 5}
            onClickFunction={handleZipCodes}
          >
            Add
          </Button>
        </div>
      </div>

      <div className={classes.filter_breed_container}>
        <label>Results per page:</label>
        <select value={filters.size} onChange={handleSizeChange}>
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} dogs
            </option>
          ))}
        </select>
      </div>
      <div className={classes.filter_zipCode_container}>
        <label>Age:</label>
        <input
          type="number"
          placeholder="Min Age"
          value={filters.ageMin || ""}
          onChange={handleAgeMin}
        />
        <input
          type="number"
          placeholder="Max Age"
          value={filters.ageMax || ""}
          onChange={handleAgeMax}
        />
      </div>

      <div>
        <div>
          {filters.zipCodes.map((zip) => (
            <span key={zip} onClick={() => removeZip(zip)}>
              {zip} X
            </span>
          ))}
        </div>
        <div>
          {filters.breeds.map((breed) => (
            <span key={breed} onClick={() => handleRemoveBreed(breed)}>
              {breed} X
            </span>
          ))}
        </div>
      </div>
      <div className={classes.filter_button_container}>
        <Button
          type="button"
          variant="secondary"
          onClickFunction={() => dispatch(resetFilter())}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
