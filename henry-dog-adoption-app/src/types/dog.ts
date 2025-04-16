export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  zip_code: string;
  img: string;
}

export interface DogListProps {
  resultIds: Dog[];
}
