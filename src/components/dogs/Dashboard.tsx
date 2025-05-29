"use client";
import React, { useEffect, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDogs,
  setDogsPage,
  toggleFavorite,
} from "../../store/slices/dogsSlice";
import {
  selectDogs,
  selectDogsLoading,
  selectDogsError,
  selectDogsTotalPages,
  selectDogsPage,
  selectDogFavorite,
} from "../../store/selectors/dogsSelectors";
import { checkAuth } from "@/store/slices/authSlice";
import Filters from "@/components/dogs/Filters";
import DogCard from "@/components/dogs/DogCard";
import Pagination from "@/components/dogs/Pagination";
import { Dog } from "@/types/dog";
import { selectFilters } from "@/store/selectors/filterSelectors";
import classes from "./styles/Dashboard.module.css";
import LoadingSpinner from "../ui/LoadingSpinner";
import SplitColorText from "../ui/SplitColorText";
import { fetchBreeds } from "@/store/slices/breedSlice";
import Button from "../ui/Button";
import { setFilters } from "@/store/slices/filtersSlice";

const Dashboard = React.memo(() => {
  const dispatch = useAppDispatch();
  const dogs = useAppSelector(selectDogs);
  const loading = useAppSelector(selectDogsLoading);
  const error = useAppSelector(selectDogsError);
  const totalPages = useAppSelector(selectDogsTotalPages);
  const page = useAppSelector(selectDogsPage);
  const filters = useAppSelector(selectFilters);
  const favorite = useAppSelector(selectDogFavorite);
  const { user, isLoggedIn } = useAppSelector((state) => state.auth);
  const name = user?.userName;
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const [hasFiltersOrPageChanged, setHasFiltersOrPageChanged] = useState(false);
  const resultIds = useAppSelector((state) => state.dogs.resultIds);

  const currentSortString = filters.sort;
  const [currentSortKey, currentSortDirection] = currentSortString.split(":");

  const hasActiveFilters =
    filters.breeds.length > 0 ||
    filters.zipCodes.length > 0 ||
    filters.ageMin !== null ||
    filters.ageMax !== null;

  useEffect(() => {
    console.log("Dashboard: Mount - Dispatching checkAuth");
    dispatch(checkAuth())
      .unwrap()
      .then(() => {
        console.log("Dashboard: checkAuth successful.");
        setIsAuthCheckComplete(true);
      })
      .catch((authError) => {
        console.error("Dashboard: checkAuth failed:", authError);
        setIsAuthCheckComplete(true);
        window.location.replace("/");
      });
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthCheckComplete) return;

    if (isLoggedIn) {
      console.log(
        "Dashboard: Auth verified & logged in. Fetching initial breeds & dogs."
      );
      dispatch(fetchBreeds());
      dispatch(fetchDogs());
    } else {
      console.log("Dashboard: Auth verified but not logged in. Redirecting.");
      window.location.replace("/");
    }
  }, [isAuthCheckComplete, isLoggedIn, dispatch]);

  useEffect(() => {
    if (!isAuthCheckComplete || !isLoggedIn) {
      return;
    }
    if (!hasFiltersOrPageChanged) {
      return;
    }

    console.log("Dashboard: Filters/page changed. Re-fetching dogs.", {
      page,
      filters,
    });
    dispatch(fetchDogs());
  }, [
    page,
    filters.breeds,
    filters.zipCodes,
    filters.ageMin,
    filters.ageMax,
    filters.size,
    filters.sort,
    dispatch,
    isAuthCheckComplete,
    isLoggedIn,
    hasFiltersOrPageChanged,
    filters,
  ]);

  useEffect(() => {
    if (isAuthCheckComplete) {
      setHasFiltersOrPageChanged(true);
    }
  }, [
    page,
    filters.breeds,
    filters.zipCodes,
    filters.ageMin,
    filters.ageMax,
    filters.size,
    filters.sort,
    isAuthCheckComplete,
  ]);

  const handleSort = (key: string) => {
    const [sortKeyFromState, sortDirectionFromState] = filters.sort.split(":");
    const newDirection =
      sortKeyFromState === key && sortDirectionFromState === "asc"
        ? "desc"
        : "asc";
    const newSortString = `${key}:${newDirection}`;

    console.log("Dashboard: Updating sort to:", newSortString);
    dispatch(setFilters({ sort: newSortString }));
    dispatch(setDogsPage(0));
  };

  const handlePageChange = useCallback(
    (newPage: number) => {
      dispatch(setDogsPage(newPage));
    },
    [dispatch]
  );

  // Ensure dogs are displayed in the order of resultIds
  const dogsById = React.useMemo(
    () => Object.fromEntries(dogs.map((dog) => [dog._id, dog])),
    [dogs]
  );
  const sortedDogs = React.useMemo(
    () => resultIds.map((id) => dogsById[id]).filter(Boolean),
    [resultIds, dogsById]
  );

  if (!isAuthCheckComplete) {
    return (
      <div className={classes.loading_container_full_page}>
        <LoadingSpinner />
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className={classes.dashboard_parent_container}>
      <div className={classes.dashboard_container}>
        {isLoggedIn && (
          <div className={classes.dashboard_header_welcome}>
            <h4>
              Welcome,{" "}
              <SplitColorText
                text={`${name}!` || "User"}
                size="large"
                tag="p"
              />
              You can now search for your ideal dog.
            </h4>
          </div>
        )}
        <div>
          <h3>Filter Dogs:</h3>
          <Filters />
        </div>
      </div>

      <div className={classes.dashboard_dogs_result}>
        <div className={classes.dashboard_dogs_result_header}>
          <h4>Available Dogs</h4>
          {dogs.length > 0 && !loading && (
            <div className={classes.sort_controls}>
              <span>Sort by:</span>
              <Button
                variant={currentSortKey === "breed" ? "primary" : "secondary"}
                onClickFunction={() => handleSort("breed")}
              >
                Breed{" "}
                {currentSortKey === "breed"
                  ? currentSortDirection === "asc"
                    ? "(A-Z)"
                    : "(Z-A)"
                  : ""}
              </Button>
              <Button
                variant={currentSortKey === "name" ? "primary" : "secondary"}
                onClickFunction={() => handleSort("name")}
              >
                Name{" "}
                {currentSortKey === "name"
                  ? currentSortDirection === "asc"
                    ? "(A-Z)"
                    : "(Z-A)"
                  : ""}
              </Button>
              <Button
                variant={currentSortKey === "age" ? "primary" : "secondary"}
                onClickFunction={() => handleSort("age")}
              >
                Age{" "}
                {currentSortKey === "age"
                  ? currentSortDirection === "asc"
                    ? "(1-9)"
                    : "(9-1)"
                  : ""}
              </Button>
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className={classes.dashboard_pagination_sections_top}>
            <Pagination
              page={page}
              setPage={handlePageChange}
              totalPages={totalPages}
            />
          </div>
        )}
        {loading ? (
          <div className={classes.loadingContainer}>
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p>{error}</p>
        ) : !hasActiveFilters && dogs.length === 0 && !error ? (
          <p>Please select at least one filter to see available dogs</p>
        ) : dogs.length > 0 ? (
          <>
            <div className={classes.dashboard_dog_card_result}>
              {sortedDogs.map((dog: Dog) => (
                <DogCard
                  key={dog._id}
                  dog={dog}
                  onToggleFavorite={(dogId: string) =>
                    dispatch(toggleFavorite({ dogId, removeFromResults: true }))
                  }
                />
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
        ) : hasActiveFilters && dogs.length === 0 && !error ? (
          (() => {
            console.log("Dashboard Debug:", {
              hasActiveFilters,
              dogsLength: dogs.length,
              error,
              filters: filters,
              currentPage: page,
              totalPages,
            });
            return <p>No dogs found. Try adjusting your search filters</p>;
          })()
        ) : null}
      </div>
    </div>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
