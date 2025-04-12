"use client";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDogs,
  setDogsPage,
  fetchFavoriteDogs,
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
import Sidebar from "@/components/layout/Sidebar";
import Filters from "@/components/dogs/Filters";
import DogCard from "@/components/dogs/DogCard";
import Pagination from "@/components/dogs/Pagination";
import { Dog } from "@/types/dog";
import { selectFilters } from "@/store/selectors/filterSelectors";
import Container from "../ui/Container";
import { useRouter } from "next/navigation";
import classes from "./styles/Dashboard.module.css";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const dogs = useAppSelector(selectDogs);
  const loading = useAppSelector(selectDogsLoading);
  const error = useAppSelector(selectDogsError);
  const totalPages = useAppSelector(selectDogsTotalPages);
  const page = useAppSelector(selectDogsPage);
  const filters = useAppSelector(selectFilters);
  const favorites = useAppSelector(selectDogFavorite);
  const { name, isLoggedIn } = useAppSelector((state) => state.auth);

  const hasActiveFilters =
    filters.breeds.length > 0 ||
    filters.zipCodes.length > 0 ||
    filters.ageMin !== null ||
    filters.ageMax !== null;

  useEffect(() => {
    // Check authentication status when component mounts
    dispatch(checkAuth()).then((result) => {
      dispatch(checkAuth());
      if (!result.payload) {
        router.push("/");
      }
    });
  }, [dispatch, router]);

  useEffect(() => {
    // Fetch favorite dogs when component mounts
    if (favorites.length > 0) {
      dispatch(fetchFavoriteDogs(favorites));
    }
  }, [dispatch, favorites]);

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

  useEffect(() => {
    if (page > 0 && hasActiveFilters) {
      dispatch(fetchDogs());
    }
  }, [dispatch, page]);

  return (
    <Container>
      <div className={classes.dashboard_container}>
        <div className={classes.dashboard_filter_sections}>
          {" "}
          {isLoggedIn && (
            <div className={classes.dashboard_header_welcome}>
              <p>Welcome, {name}! You can now search for your ideal dog.</p>
            </div>
          )}
          {/* Sidebar */}
          <Sidebar>
            <Filters />
          </Sidebar>
        </div>

        <div className={classes.dashboard_dogs_result}>
          {" "}
          {/* Main Content */}
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
            <div className={classes.dashboard_dog_card_result}>
              {dogs.map((dog: Dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          ) : (
            <p>No dogs found. Try adjusting your search filters</p>
          )}
        </div>

        <div className={classes.dashboard_pagination_sections}>
          {" "}
          {/* Pagination spanning full width */}
          <Pagination
            page={page}
            setPage={(page) => dispatch(setDogsPage(page))}
            totalPages={totalPages}
          />
        </div>
      </div>
    </Container>
  );
}
