export const BOROUGHS = {
  MANHATTAN: "Manhattan",
  BROOKLYN: "Brooklyn",
  QUEENS: "Queens",
  BRONX: "Bronx",
  STATEN_ISLAND: "Staten Island",
} as const;

export type Borough = (typeof BOROUGHS)[keyof typeof BOROUGHS];

// Helper function to get borough values as array
export const getBoroughValues = (): Borough[] => Object.values(BOROUGHS);
