"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Image from "next/image";
import Link from "next/link";
import { DogCardProps } from "@/types/dogCardProps";
import { DogInterface } from "@/types/dog";

export default function DogCard({ dogId }: DogCardProps) {
  const [dog, setDog] = useState<DogInterface | null>(null);
  const route = "/dogs";

  useEffect(() => {
    try {
      apiClient.post(route, [dogId]).then((res) => setDog(res.data[0]));
    } catch (err) {
      console.error("Error fetching dog details", err);
    }
  }, [dogId]);

  if (!dog) {
    return <p>Loading Dog...</p>;
  }

  return (
    <div>
      <Image src={dog.img} alt={dog.name} width={200} height={200} />
      <h2>{dog.name}</h2>
      <p>Breed: {dog.breed}</p>
      <p>Age: {dog.age}</p>
      <p>Zip Code: {dog.zipCode}</p>
      <Link href={`/dogs/${dog.id}`}>View Details</Link>
    </div>
  );
}
