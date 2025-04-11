"use client";
import React, { useEffect } from "react";
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
import Button from "@/components/ui/Button";
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
        <div className={classes.dashboard_header}>
          {" "}
          {/* Header spanning full width */}
          <h3>Henry's Dog Adoption Agency</h3>
          {isLoggedIn && (
            <div className={classes.dashboard_header_welcome}>
              <p>Welcome, {name}!</p>
            </div>
          )}
        </div>

        <div className={classes.dashboard_filter_sections}>
          {" "}
          {/* Sidebar */}
          <Filters />
        </div>

        <div className={classes.dashboard_dogs_result}>
          {" "}
          {/* Main Content */}
          <div className={classes.dashboard_dogs_result_header}>
            <h2>Available Dogs</h2>
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
