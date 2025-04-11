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
      <div>
        {loading ? (
          <p>Finding your perfect match...</p>
        ) : error ? (
          <p>{error}</p>
        ) : match ? (
          <div>
            <div>{match.img && <img src={match.img} alt={match.name} />}</div>
            <div>
              <p>Name: {match.name}</p>
              <p>Breed: {match.breed}</p>
              <p>Age: {match.age} years</p>
              <p>Zip Code: {match.zipCode}</p>
            </div>
          </div>
        ) : (
          <p>No match found. Try adding some favorites!</p>
        )}
        <div>
          <button onClick={handleCloseModal}>Back to Search</button>
        </div>
      </div>
    </Modal>
  );
}
