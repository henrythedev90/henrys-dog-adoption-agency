"use client";
import React, { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDogs, setDogsPage } from "../../store/slices/dogsSlice";
import {
  selectDogs,
  selectDogsLoading,
  selectDogsError,
  selectDogsTotalPages,
  selectDogsPage,
} from "../../store/selectors/dogsSelectors";
import { checkAuth } from "@/store/slices/authSlice";
import Filters from "@/components/dogs/Filters";
import DogCard from "@/components/dogs/DogCard";
import Pagination from "@/components/dogs/Pagination";
import { Dog } from "@/types/dog";
import { selectFilters } from "@/store/selectors/filterSelectors";
import Container from "../ui/Container";
import { useRouter } from "next/navigation";
import classes from "./styles/Dashboard.module.css";

const Dashboard = React.memo(() => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const dogs = useAppSelector(selectDogs);
  const loading = useAppSelector(selectDogsLoading);
  const error = useAppSelector(selectDogsError);
  const totalPages = useAppSelector(selectDogsTotalPages);
  const page = useAppSelector(selectDogsPage);
  const filters = useAppSelector(selectFilters);
  const { name, isLoggedIn } = useAppSelector((state) => state.auth);

  const hasActiveFilters =
    filters.breeds.length > 0 ||
    filters.zipCodes.length > 0 ||
    filters.ageMin !== null ||
    filters.ageMax !== null;

  useEffect(() => {
    // Check authentication status when component mounts
    dispatch(checkAuth()).then((result) => {
      if (!result.payload) {
        router.push("/");
      }
    });
  }, [dispatch, router]);

  useEffect(() => {
    // Fetch dogs when page changes or filters change
    if (hasActiveFilters) {
      dispatch(fetchDogs());
    }
  }, [
    dispatch,
    page,
    hasActiveFilters,
    filters.breeds,
    filters.zipCodes,
    filters.ageMin,
    filters.ageMax,
    filters.size, // Add size to dependencies
  ]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      dispatch(setDogsPage(newPage));
    },
    [dispatch]
  );

  return (
    <div className={classes.dashboard_parent_container}>
      <div className={classes.dashboard_container}>
        <div className={classes.dashboard_filter_sections}>
          {isLoggedIn && (
            <div className={classes.dashboard_header_welcome}>
              <p>Welcome, {name}! You can now search for your ideal dog.</p>
            </div>
          )}
          <div>
            <h3>Filter Dogs:</h3>
            <Filters />
          </div>
        </div>
      </div>

      <div className={classes.dashboard_dogs_result}>
        <div className={classes.dashboard_dogs_result_header}>
          <h4>Available Dogs</h4>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : !hasActiveFilters ? (
          <p>Please select at least one filter to see available dogs</p>
        ) : dogs.length > 0 ? (
          <>
            <div className={classes.dashboard_dog_card_result}>
              {dogs.map((dog: Dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className={classes.dashboard_pagination_sections}>
                <Pagination
                  page={page}
                  setPage={handlePageChange}
                  totalPages={totalPages}
                />
              </div>
            )}
          </>
        ) : (
          <p>No dogs found. Try adjusting your search filters</p>
        )}
      </div>
    </div>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
