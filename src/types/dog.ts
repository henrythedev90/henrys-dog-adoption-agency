export interface Dog {
  _id: string;
  name: string;
  breed: string;
  age: number;
  img: string;
  zip_code: string;
  borough: string;
}

export interface DogListProps {
  resultIds: Dog[];
}
