import Image from "next/image";
import React from "react";
import { Dog } from "@/types/dog";

interface DogCardProps {
  dog: Dog;
}
export default function DogCard({ dog }: DogCardProps) {
  return (
    <div>
      <Image src={dog.img} alt={dog.name} width={200} height={200} />
      <h2>{dog.name}</h2>
      <p>Breed: {dog.breed}</p>
      <p>Age: {dog.age}</p>
      <p>Zip Code: {dog.zipCode}</p>
    </div>
  );
}
