import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Helper function to fetch dog details
async function fetchDogDetails(dogId: string, cookies: string | undefined) {
  try {
    console.log(
      `Match API (Favorite Picker): Fetching details for selected favorite ID: ${dogId}`
    );
    const response = await axios.post(
      "https://frontend-take-home-service.fetch.com/dogs",
      [dogId], // API expects an array of IDs
      {
        headers: {
          Cookie: cookies || "",
          "Content-Type": "application/json",
        },
        withCredentials: true, // Important for the direct call
      }
    );
    const dogData = response.data?.[0] || null;
    console.log(
      `Match API (Favorite Picker): Details received for ${dogId}:`,
      dogData ? "Yes" : "No"
    );
    return dogData;
  } catch (error) {
    console.error(
      `Match API (Favorite Picker): Error fetching details for dog ${dogId}:`,
      error
    );
    return null; // Return null if fetching details fails
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    console.log("Match API (Favorite Picker): Invalid method:", req.method);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { favoriteIds } = req.body;
    const cookies = req.headers.cookie; // Get cookies from the incoming request

    if (!cookies) {
      console.error(
        "Match API (Favorite Picker): Authentication cookies missing"
      );
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Validate favoriteIds
    if (!favoriteIds || !Array.isArray(favoriteIds)) {
      console.error(
        "Match API (Favorite Picker): Invalid favoriteIds received:",
        favoriteIds
      );
      return res.status(400).json({
        message: "Invalid request body: favoriteIds must be an array.",
      });
    }

    // Check if the favorites list is empty
    if (favoriteIds.length === 0) {
      console.log("Match API (Favorite Picker): favoriteIds array is empty.");
      return res.status(400).json({
        message: "Cannot find a match from an empty favorites list.",
      });
    }

    console.log(
      "Match API (Favorite Picker): Received favorite IDs:",
      favoriteIds
    );

    // Randomly select one ID from the favoriteIds array
    const randomIndex = Math.floor(Math.random() * favoriteIds.length);
    const selectedFavoriteId = favoriteIds[randomIndex];
    console.log(
      "Match API (Favorite Picker): Randomly selected favorite ID:",
      selectedFavoriteId
    );

    // Fetch the details for the selected favorite dog
    const dogToReturn = await fetchDogDetails(selectedFavoriteId, cookies);

    // Handle case where fetching details failed for the selected ID
    if (!dogToReturn) {
      console.error(
        `Match API (Favorite Picker): Failed to fetch details for the selected favorite ID: ${selectedFavoriteId}.`
      );
      return res.status(500).json({
        message: "Could not retrieve details for the selected favorite dog.",
      });
    }

    console.log(
      "Match API (Favorite Picker): Successfully returning selected favorite dog:",
      {
        id: dogToReturn.id,
        name: dogToReturn.name,
      }
    );
    // Return the details of the randomly selected favorite dog
    return res.status(200).json(dogToReturn);
  } catch (error: any) {
    // Catch unexpected errors in the handler itself
    console.error(
      "Match API (Favorite Picker): Unexpected error in handler:",
      error
    );
    return res.status(500).json({
      message: "Internal server error processing match request.",
    });
  }
}
