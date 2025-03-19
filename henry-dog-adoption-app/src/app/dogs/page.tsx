"use client";
import React from "react";
import { useState, useEffect } from "react";
import Filters from "../../components/dogs/Filters";
import { apiClient } from "@/lib/apiClient";
import { FilterState } from "@/types/filters";
import { DogInterface } from "@/types/dog";
import DogList from "@/components/dogs/DogList";

export default function DogsPage() {
  const route = "/dogs/search";
  const [dogs, setDogs] = useState<DogInterface[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    breed: [] as string[],
    zipCode: [] as string[],
    ageMin: 0,
    ageMax: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");

    apiClient
      .get(route, {
        params: {
          breed: filters.breed.length ? filters.breed : undefined,
          zipCodes: filters.zipCode.length ? filters.zipCode : undefined,
          ageMin: filters.ageMin || undefined,
          ageMax: filters.ageMax || undefined,
          size: 25,
          from: page * 25,
          sort: "breed:asc",
        },
      })
      .then((res) => setDogs(res.data.resultIds || []))
      .catch(() => setError("Failed to fetch the dogs"))
      .finally(() => setLoading(false));
  }, [filters, page, loading]);

  return (
    <div>
      <Filters filters={filters} setFilters={setFilters} />
      {loading ? <p>Loading...</p> : <DogList dogs={dogs} />}
      {error && <p>{error}</p>}
    </div>
  );
}
