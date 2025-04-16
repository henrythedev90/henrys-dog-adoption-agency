"use client";
import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDogs,
  setDogsPage,
  clearBreeds,
} from "../../store/slices/dogsSlice";
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
import { useRouter } from "next/navigation";
import classes from "./styles/Dashboard.module.css";
import LoadingSpinner from "../ui/LoadingSpinner";
import SplitColorText from "../ui/SplitColorText";
import { fetchBreeds } from "@/store/slices/breedSlice";
import Button from "../ui/Button";

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
  const [authChecked, setAuthChecked] = useState(false);

  // --- Add State for Sorting ---
  const [sortKey, setSortKey] = useState<keyof Dog | null>(null); // 'breed', 'name', 'age'
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const hasActiveFilters =
    filters.breeds.length > 0 ||
    filters.zipCodes.length > 0 ||
    filters.ageMin !== null ||
    filters.ageMax !== null;

  useEffect(() => {
    // Check authentication status when component mounts
    console.log("Dashboard: Checking auth status");
    dispatch(checkAuth()).then((result) => {
      console.log("Dashboard: Auth check result:", result.payload);
      setAuthChecked(true);
      if (!result.payload) {
        console.log("Dashboard: Auth check failed, redirecting to home");
        window.location.replace("/");
      }
    });
  }, [dispatch, router]);

  // Add a separate effect to watch for auth state changes
  useEffect(() => {
    if (authChecked && !isLoggedIn) {
      console.log("Dashboard: Not logged in, redirecting to home");
      window.location.replace("/");
    }
  }, [isLoggedIn, authChecked]);

  // On initial load, fetch all dogs
  useEffect(() => {
    // Only fetch breeds if user is logged in
    if (isLoggedIn) {
      console.log("Dashboard: Fetching breeds as user is logged in");
      dispatch(fetchBreeds());
    }
  }, [dispatch, isLoggedIn]);

  // Fetch dogs based on filters
  useEffect(() => {
    // Only fetch dogs if user is logged in
    if (!isLoggedIn) {
      console.log("Dashboard: Skipping dog fetch - not logged in yet");
      return;
    }

    // Clear results when filters are removed
    if (!hasActiveFilters) {
      console.log("Dashboard: No active filters, clearing results");
      dispatch(clearBreeds());
      return;
    }

    // Apply filters to the already fetched dogs
    console.log("Dashboard: Fetching dogs with filters:", filters);
    dispatch(fetchDogs());
  }, [
    dispatch,
    page,
    hasActiveFilters,
    filters.breeds,
    filters.zipCodes,
    filters.ageMin,
    filters.ageMax,
    filters.size,
    isLoggedIn,
  ]);

  // --- Sorting Logic ---
  const sortedDogs = useMemo(() => {
    if (!sortKey) return dogs; // No sorting if no key is selected

    // Create a copy to avoid mutating the original Redux state
    const dogsToSort = [...dogs];

    dogsToSort.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }

      return sortDirection === "asc" ? comparison : comparison * -1;
    });

    return dogsToSort;
  }, [dogs, sortKey, sortDirection]);

  const handleSort = (key: keyof Dog) => {
    const newDirection =
      sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDirection(newDirection);
  };

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
              <p>
                Welcome, <SplitColorText text={name} size="small" tag="span" />!
                You can now search for your ideal dog.
              </p>
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
          {dogs.length > 0 && (
            <div className={classes.sort_controls}>
              <span>Sort by:</span>
              <Button
                variant={sortKey === "breed" ? "primary" : "secondary"}
                onClickFunction={() => handleSort("breed")}
              >
                Breed{" "}
                {sortKey === "breed"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </Button>
              <Button
                variant={sortKey === "name" ? "primary" : "secondary"}
                onClickFunction={() => handleSort("name")}
              >
                Name{" "}
                {sortKey === "name"
                  ? sortDirection === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </Button>
              <Button
                variant={sortKey === "age" ? "primary" : "secondary"}
                onClickFunction={() => handleSort("age")}
              >
                Age{" "}
                {sortKey === "age" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </Button>
            </div>
          )}
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <p>{error}</p>
        ) : !hasActiveFilters ? (
          <p>Please select at least one filter to see available dogs</p>
        ) : sortedDogs.length > 0 ? (
          <>
            <div className={classes.dashboard_dog_card_result}>
              {/* --- Render Sorted Dogs --- */}
              {sortedDogs.map((dog: Dog) => (
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
