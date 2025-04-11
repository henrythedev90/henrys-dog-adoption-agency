"use client";
import React, { useEffect } from "react";
import { FilterState } from "@/types/filters";
import { Dog } from "@/types/dog";
import DogList from "@/components/dogs/DogList";
import Filters from "../../components/dogs/Filters";
import Pagination from "../../components/dogs/Pagination";

export default function page() {
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
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchDogs = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await apiClient.get(route, {
          params: {
            breed: filters.breeds.length ? filters.breed : undefined,
            zipCodes: filters.zipCode.length ? filters.zipCode : undefined,
            ageMin: filters.ageMin || undefined,
            ageMax: filters.ageMax || undefined,
            size: 25,
            from: page * 25,
            sort: "breed:asc",
          },
        });
        setDogs(response.data.resultsId || []);
      } catch (err) {
        setError("Failed to getch dogs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDogs();
  }, [filters, page]);

  return (
    <div>
      <Filters />
      {loading ? (
        <p>Loading...</p>
      ) : dogs.length > 0 ? (
        <>
          <DogList dogIds={dogs.map((dog) => dog.id)} />
          <Pagination page={page} setPage={setPage} totalPages={totalPages} />
        </>
      ) : (
        <p>No dogs found. Try adjusting your search filters</p>
      )}
      {error && <p>{error}</p>}
    </div>
  );
}
