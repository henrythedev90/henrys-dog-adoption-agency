"use client";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDogs,
  setDogsPage,
  clearDogs,
} from "../../store/slices/dogsSlice";
import {
  selectDogs,
  selectDogsLoading,
  selectDogsError,
  selectDogsTotalPages,
  selectDogsPage,
} from "../../store/selectors/dogsSelectors";
import Sidebar from "@/components/layout/Sidebar";
import Filters from "@/components/dogs/Filters";
import DogCard from "@/components/dogs/DogCard";
import Pagination from "@/components/dogs/Pagination";
import { Dog } from "@/types/dog";
import { selectFilters } from "@/store/selectors/filterSelectors";
import Button from "@/components/ui/Button";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function page() {
  const dispatch = useAppDispatch();
  const dogs = useAppSelector(selectDogs);
  const loading = useAppSelector(selectDogsLoading);
  const error = useAppSelector(selectDogsError);
  const totalPages = useAppSelector(selectDogsTotalPages);
  const page = useAppSelector(selectDogsPage);
  const filters = useAppSelector(selectFilters);

  const hasActiveFilters =
    filters.breeds.length > 0 ||
    filters.zipCodes.length > 0 ||
    filters.ageMin !== null ||
    filters.ageMax !== null;

  useEffect(() => {
    // Reset to first page when filters change
    if (page !== 0) {
      dispatch(setDogsPage(0));
    } else if (hasActiveFilters) {
      dispatch(fetchDogs());
    }
  }, [
    dispatch,
    filters.breeds,
    filters.zipCodes,
    filters.ageMin,
    filters.ageMax,
  ]);

  // Separate effect for page changes
  useEffect(() => {
    if (page > 0 && hasActiveFilters) {
      dispatch(fetchDogs());
    }
  }, [dispatch, page]);

  const handleClear = () => {
    dispatch(clearDogs());
  };

  return (
    <div>
      <Header />
      <div>
        <Sidebar>
          <Filters />
        </Sidebar>
        <div>
          <div>
            <h2>Available Dogs</h2>
            {dogs.length > 0 && (
              <Button variant="secondary" onClick={handleClear}>
                Clear Results
              </Button>
            )}
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : !hasActiveFilters ? (
            <p>Please select at least one filter to see available dogs</p>
          ) : dogs.length > 0 ? (
            <div>
              {dogs.map((dog: Dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          ) : (
            <p>No dogs found. Try adjusting your search filters</p>
          )}
        </div>

        <Footer>
          <Pagination
            page={page}
            setPage={(page) => dispatch(setDogsPage(page))}
            totalPages={totalPages}
          />
        </Footer>
      </div>
    </div>
  );
}
