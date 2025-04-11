export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  zipCode: string;
  img: string;
}

export interface DogListProps {
  dogs: Dog[];
}
