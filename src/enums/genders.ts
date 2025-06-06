export const GENDERS = {
  MALE: "male",
  FEMALE: "female",
} as const;

export type Gender = (typeof GENDERS)[keyof typeof GENDERS];

export const getGenderValues = (): Gender[] => Object.values(GENDERS);
