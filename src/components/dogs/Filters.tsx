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
  PageSize,
} from "../../store/slices/filtersSlice";
import {
  selectBreeds,
  selectBreedsLoading,
  selectBreedsError,
} from "../../store/selectors/breedSelectors";
import Button from "../ui/Button";
import styles from "./styles/Filters.module.css";
import { BOROUGHS, Borough } from "@/enums/boroughs";

export default function Filters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const breeds = useAppSelector(selectBreeds);
  const loadingBreeds = useAppSelector(selectBreedsLoading);
  const breedsError = useAppSelector(selectBreedsError);
  const [zipInput, setZipInput] = useState("");
  const [validateTimeout, setValidateTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [ageMaxInput, setAgeMaxInput] = useState("");
  // Create timeout ref for debounce

  useEffect(() => {
    dispatch(fetchBreeds());
  }, [dispatch]);

  const handleBreedsSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBreed = e.target.value;
    if (selectedBreed && !filters.breeds.includes(selectedBreed)) {
      dispatch(setFilters({ breeds: [...filters.breeds, selectedBreed] }));
    }
  };

  const handleBoroughSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBorough = e.target.value as Borough;
    if (selectedBorough && !filters.boroughs?.includes(selectedBorough)) {
      dispatch(
        setFilters({
          boroughs: [...(filters.boroughs || []), selectedBorough],
        })
      );
    }
  };

  const handleRemoveBreed = (breedToRemove: string) => {
    dispatch(
      setFilters({
        breeds: filters.breeds.filter((breed) => breed !== breedToRemove),
      })
    );
  };

  const handleRemoveBorough = (boroughToRemove: Borough) => {
    dispatch(
      setFilters({
        boroughs:
          filters.boroughs?.filter((borough) => borough !== boroughToRemove) ||
          [],
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
      alert("Please enter a number bigger than 0.");
      return;
    }
    if (filters.ageMax !== null && value > filters.ageMax) {
      alert("Minimum age cannot be greater than maximum age.");
      return;
    }
    dispatch(setFilters({ ageMin: value }));
  };

  const handleAgeMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Set the raw value immediately without validation for a smoother typing experience
    // Use a temporary state variable to track what the user is typing
    setAgeMaxInput(inputValue);

    // Handle empty input
    if (inputValue === "") {
      dispatch(setFilters({ ageMax: null }));
      return;
    }

    const value = parseInt(inputValue, 10);
    if (isNaN(value)) {
      return; // Don't update if it's not a valid number
    }

    // Clear previous timeout if it exists
    if (validateTimeout) {
      clearTimeout(validateTimeout);
    }

    // Set new timeout for debounced validation
    const newTimeout = setTimeout(() => {
      // Only apply validation when the user has stopped typing
      if (filters.ageMin !== null && value < filters.ageMin) {
        alert("Maximum age cannot be less than minimum age.");
        setAgeMaxInput(filters.ageMin.toString()); // Update input field
        dispatch(setFilters({ ageMax: filters.ageMin }));
      } else {
        dispatch(setFilters({ ageMax: value }));
      }
    }, 1000); // 1 second debounce

    setValidateTimeout(newTimeout);
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = parseInt(e.target.value) as (typeof PAGE_SIZES)[number];
    dispatch(setFilters({ size }));
  };

  return (
    <div className={classes.filter_container}>
      <div>
        <div className={classes.filter_breed_container}>
          <label>Breed:</label>
          <select
            onChange={handleBreedsSelect}
            value=""
            disabled={filters.breeds.length >= 5}
          >
            <option value="" disabled>
              Select a breed
            </option>
            {loadingBreeds ? (
              <option>Loading breeds...</option>
            ) : breedsError ? (
              <option>Error loading breeds.</option>
            ) : (
              breeds.map((breed: string) => (
                <option
                  key={breed}
                  value={breed}
                  disabled={filters.breeds.includes(breed)}
                  style={{
                    color: filters.breeds.includes(breed) ? "#999" : "inherit",
                  }}
                >
                  {breed} {filters.breeds.includes(breed) ? "(Selected)" : ""}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <div className={classes.filter_breed_container}>
            <label>Borough:</label>
            <select
              onChange={handleBoroughSelect}
              value=""
              disabled={filters.boroughs?.length >= 5}
            >
              <option value="" disabled>
                Select a borough
              </option>
              {Object.values(BOROUGHS).map((borough) => (
                <option
                  key={borough}
                  value={borough}
                  disabled={filters.boroughs?.includes(borough)}
                  style={{
                    color: filters.boroughs?.includes(borough)
                      ? "#999"
                      : "inherit",
                  }}
                >
                  {borough}{" "}
                  {filters.boroughs?.includes(borough) ? "(Selected)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className={classes.filter_breed_container}>
            <label>Results per page:</label>
            <select value={filters.size} onChange={handleSizeChange}>
              {PAGE_SIZES.map((size: PageSize) => (
                <option key={size} value={size}>
                  {size} dogs
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
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

          <div className={classes.filter_age_container}>
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
              value={ageMaxInput}
              onChange={handleAgeMax}
              onBlur={() => {
                // Also validate on blur for immediate feedback when user tabs/clicks away
                const value = parseInt(ageMaxInput, 10);
                if (
                  !isNaN(value) &&
                  filters.ageMin !== null &&
                  value < filters.ageMin
                ) {
                  alert("Maximum age cannot be less than minimum age.");
                  setAgeMaxInput(filters.ageMin.toString());
                  dispatch(setFilters({ ageMax: filters.ageMin }));
                }
              }}
            />
          </div>
        </div>

        <div className={styles.tags_container}>
          <div className={styles.tag_group}>
            {filters.zipCodes.map((zip) => (
              <span
                key={zip}
                className={styles.tag_zipCode}
                onClick={() => removeZip(zip)}
              >
                {zip}
                <span className={styles.tag_remove}>×</span>
              </span>
            ))}
          </div>
          <div className={styles.tag_group}>
            {filters.breeds.map((breed) => (
              <span
                key={breed}
                className={styles.tag}
                onClick={() => handleRemoveBreed(breed)}
              >
                {breed}
                <span className={styles.tag_remove}>×</span>
              </span>
            ))}
          </div>
          <div className={styles.tag_group}>
            {filters.boroughs?.map((borough) => (
              <span
                key={borough}
                className={styles.tag}
                onClick={() => handleRemoveBorough(borough)}
              >
                {borough}
                <span className={styles.tag_remove}>×</span>
              </span>
            ))}
          </div>
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
