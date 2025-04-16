import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Helper function to fetch dog details (Ensure it returns full dog object or null)
async function fetchDogDetails(
  dogId: string,
  cookieHeader: string | undefined
) {
  try {
    const response = await axios.post(
      "https://frontend-take-home-service.fetch.com/dogs",
      [dogId], // API expects an array of IDs
      {
        headers: {
          Cookie: cookieHeader, // Pass the received cookies
          "Content-Type": "application/json",
        },
      }
    );

    const potentialDogData = response.data?.[0]; // Get the first item, could be {} or a dog

    // Add validation: Check if the received data has an ID
    if (potentialDogData && potentialDogData.id) {
      return potentialDogData; // Return the valid dog object
    } else {
      return null; // Return null if data is invalid or missing ID
    }
  } catch (error: any) {
    console.error(
      `fetchDogDetails: Error during POST to external /dogs for ID ${dogId}. Status: ${error.response?.status}.`,
      error.message
    );

    return null; // Return null if fetching details fails
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const favoriteIds = req.body;

    // Get raw cookie header - critical for authentication
    const cookieHeader = req.headers.cookie;

    // Check for cookies
    if (!cookieHeader) {
      return res
        .status(401)
        .json({ message: "Authentication cookies missing" });
    }

    // Validate favoriteIds is an array
    if (!Array.isArray(favoriteIds)) {
      console.error(
        "Match API: Invalid request body received, expected array:",
        favoriteIds
      );
      return res.status(400).json({
        message: "Invalid request body: favoriteIds must be an array.",
      });
    }

    if (favoriteIds.length === 0) {
      return res.status(400).json({
        message: "Cannot find a match from an empty favorites list.",
      });
    }

    let dogIdToFetch: string | null = null;

    try {
      const matchResponse = await axios.post(
        "https://frontend-take-home-service.fetch.com/dogs/match",
        favoriteIds,
        {
          headers: {
            Cookie: cookieHeader,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        matchResponse.data &&
        typeof matchResponse.data.match === "string" &&
        matchResponse.data.match
      ) {
        dogIdToFetch = matchResponse.data.match;
        console.log(
          `Match API: External API provided specific match ID: ${dogIdToFetch}`
        );
      } else {
        console.log(
          "Match API: External API did not return a specific match ID."
        );
      }
    } catch (matchError: any) {
      const status = matchError.response?.status;
      console.error(
        `Match API: Error during POST to external /dogs/match. Status: ${status}.`,
        matchError.message
      );

      // If we got a 401, there's likely an issue with the cookies
      if (status === 401) {
        // Return a specific error message for unauthorized
        return res.status(401).json({
          message:
            "Authentication failed when contacting Fetch API. Please log in again.",
          error: "unauthorized",
        });
      }

      // If external match fails, we proceed to pick a random favorite
      dogIdToFetch = null;
    }

    // 2. If external API didn't give a match, pick randomly from favorites
    if (!dogIdToFetch) {
      const randomIndex = Math.floor(Math.random() * favoriteIds.length);
      dogIdToFetch = favoriteIds[randomIndex];
    }

    // Ensure dogIdToFetch is a non-null string before proceeding
    if (!dogIdToFetch || typeof dogIdToFetch !== "string") {
      return res.status(500).json({
        message: "Internal error: Could not determine dog ID for matching.",
      });
    }

    const dogToReturn = await fetchDogDetails(dogIdToFetch, cookieHeader);

    // Handle case where fetching details failed
    if (!dogToReturn) {
      return res.status(500).json({
        message: `Could not retrieve details for dog ID: ${dogIdToFetch}.`,
      });
    }

    return res.status(200).json(dogToReturn);
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal server error processing match request.",
    });
  }
}
