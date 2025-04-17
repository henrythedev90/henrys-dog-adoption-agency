import { useState } from "react";
import Image from "next/image";

function DogCardImage({
  urlImage,
  title,
}: {
  urlImage: string | null;
  title: string;
}) {
  const [imageSrc, setImageSrc] = useState(urlImage || "/placeholder.png");

  return (
    <Image
      src={imageSrc}
      alt={title}
      width={120}
      height={120}
      onError={() => setImageSrc("/placeholder.png")}
    />
  );
}

export default DogCardImage;
