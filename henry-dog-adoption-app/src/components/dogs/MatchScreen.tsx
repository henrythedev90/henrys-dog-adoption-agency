import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMatch } from "@/store/slices/dogsSlice";
import { selectDogFavorite } from "@/store/selectors/dogsSelectors";
import Modal from "@/components/ui/Modal";

export default function MatchScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectDogFavorite) as string[];
  const { match, loading, error } = useAppSelector((state) => state.dogs);
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    if (favorites.length > 0) {
      dispatch(fetchMatch(favorites));
    }
  }, [dispatch, favorites]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push("/dogs");
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      title="Your Lucky Match!"
    >
      <div className="space-y-4">
        {loading ? (
          <p className="text-center">Finding your perfect match...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : match ? (
          <div className="space-y-2">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              {match.img && (
                <img
                  src={match.img}
                  alt={match.name}
                  className="object-cover rounded-lg w-full h-48"
                />
              )}
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Name: {match.name}</p>
              <p>Breed: {match.breed}</p>
              <p>Age: {match.age} years</p>
              <p>Zip Code: {match.zipCode}</p>
            </div>
          </div>
        ) : (
          <p className="text-center">
            No match found. Try adding some favorites!
          </p>
        )}
        <div className="flex justify-center mt-4">
          <button
            onClick={handleCloseModal}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    </Modal>
  );
}
