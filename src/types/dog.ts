export interface Dog {
  _id: string;
  name: string;
  breed: string;
  age: number;
  img: string;
  zip_code: string;
  borough: string;
  // size: string;
  // gender: string;
  // breed_group: string;
  // color: string;
  // coat_length: string;
  // good_with_children: boolean;
  // good_with_other_dogs: boolean;
  // good_with_strangers: boolean;
  // energy_level: number;
  // barking_level: number;
  // shedding_level: number;
  // coat_type: string;
  // good_with_cats: boolean;
}

export interface DogListProps {
  resultIds: Dog[];
}
