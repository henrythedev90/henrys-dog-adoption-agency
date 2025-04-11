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
import Sidebar from "@/components/layout/Sidebar";
import Filters from "@/components/dogs/Filters";
import DogCard from "@/components/dogs/DogCard";
import Pagination from "@/components/dogs/Pagination";
import { Dog } from "@/types/dog";
import { selectFilters } from "@/store/selectors/filterSelectors";

export default function page() {
  const dispatch = useAppDispatch();
  const dogs = useAppSelector(selectDogs);
  console.log(dogs, "this is dogs");
  const loading = useAppSelector(selectDogsLoading);
  const error = useAppSelector(selectDogsError);
  const totalPages = useAppSelector(selectDogsTotalPages);
  const page = useAppSelector(selectDogsPage);
  const filters = useAppSelector(selectFilters);

  useEffect(() => {
    dispatch(fetchDogs());
  }, [dispatch, page, filters]);

  return (
    <div>
      <div>
        <Sidebar>
          <Filters />
        </Sidebar>
        <div>
          <h2>Available Dogs</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
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

        <div>
          <Pagination
            page={page}
            setPage={(page) => dispatch(setDogsPage(page))}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
}
