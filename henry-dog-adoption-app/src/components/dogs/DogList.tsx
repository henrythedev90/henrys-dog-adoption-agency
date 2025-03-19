import { DogInterface, DogListProps } from "@/types/dog";
import DogCard from "./DogCard";

export default function DogList({ dogs }: DogListProps) {
  if (dogs.length === 0) {
    return <p>No Dogs were found</p>;
  }
  console.log(dogs);
  return (
    <div>
      {dogs.map((dog) => (
        <DogCard key={dog.id} dogId={dog.id} />
      ))}
    </div>
  );
}
