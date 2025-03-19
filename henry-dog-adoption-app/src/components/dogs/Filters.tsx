"use client";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { FilterState, FiltersProps } from "@/types/filters";
import { BreedList } from "@/types/breeds";

export default function Filters({ filters, setFilters }: FiltersProps) {
  const route = "/dogs/breeds";
  const [breeds, setBreeds] = useState<BreedList["breeds"]>([]);
  const [loadingBreeds, setLoadingBreeds] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [zipInput, setZipInput] = useState("");

  useEffect(() => {
    apiClient
      .get(route)
      .then((res) => setBreeds(res.data))
      .catch((err) => console.error("Error fetching breeds", err))
      .finally(() => setLoadingBreeds(false));
  }, []);

  const handleBreedsClick = (selectedBreed: string) => {
    setFilters((prev) => ({
      ...prev,
      breed: prev.breed.includes(selectedBreed)
        ? prev.breed.filter((b) => b !== selectedBreed)
        : [...prev.breed, selectedBreed],
    }));
  };

  const handleZipCodes = () => {
    if (zipInput.trim() !== "" && !filters.zipCode.includes(zipInput.trim())) {
      setFilters((prev) => ({
        ...prev,
        zipCode: [...prev.zipCode, zipInput.trim()],
      }));
    }
  };

  const removeZip = (zip: string) => {
    setFilters((prev) => ({
      ...prev,
      zipCode: prev.zipCode.filter((z) => z !== zip),
    }));
  };

  return (
    <div>
      <div>
        <label>Breed:</label>
        <div onClick={() => setShowDropdown(!showDropdown)}>
          <div>
            {filters.breed.map((breed) => (
              <span>{breed} X</span>
            ))}
          </div>
          <button>Select Breeds:</button>
        </div>
        {showDropdown && (
          <div>
            {loadingBreeds ? (
              <p>Loading Breeds...</p>
            ) : (
              breeds.map((breed: string) => (
                <div
                  key={breed}
                  className={`dropdown-item ${
                    filters.breed.includes(breed) ? "selected" : ""
                  }`}
                  onClick={() => handleBreedsClick(breed)}
                ></div>
              ))
            )}
          </div>
        )}
      </div>

      <div>
        <label>ZIP Codes:</label>
        <div>
          <input
            type="text"
            placeholder="Enter ZIP Codes"
            value={zipInput}
            onChange={(e) => setZipInput(e.target.value)}
          />
          <button type="button" onClick={handleZipCodes}>
            Add
          </button>
        </div>
        <div>
          {filters.zipCode.map((zip) => (
            <span key={zip} onClick={() => removeZip(zip)}>
              {zip} X
            </span>
          ))}
        </div>
      </div>

      <input
        type="number"
        placeholder="Min Age"
        value={filters.ageMin || ""}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            filters: { ...prev, ageMin: Number(e.target.value) },
          }))
        }
      />
      <input
        type="number"
        placeholder="Max Age"
        value={filters.ageMax || ""}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, ageMax: Number(e.target.value) }))
        }
      />
    </div>
  );
}
