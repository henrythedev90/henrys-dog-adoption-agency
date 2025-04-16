import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Helper function to fetch dog details (Ensure it returns full dog object or null)
async function fetchDogDetails(
  dogId: string,
  cookieHeader: string | undefined
) {
  console.log(
    `fetchDogDetails: Attempting POST to external /dogs for ID ${dogId}`
  );
  console.log(`Cookie header being sent: ${cookieHeader?.substring(0, 20)}...`);

  try {
    console.log(
      `Match API (Favorite Picker): Fetching details for selected favorite ID: ${dogId}`
    );
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

    // Log the RAW response from the external API
    console.log(
      `Match API (Favorite Picker): RAW response from external /dogs for ID ${dogId}:`,
      {
        status: response.status,
        data: response.data ? "Data present" : "No data", // Avoid logging full data
      }
    );

    const potentialDogData = response.data?.[0]; // Get the first item, could be {} or a dog

    // Add validation: Check if the received data has an ID
    if (potentialDogData && potentialDogData.id) {
      console.log(
        `Match API (Favorite Picker): Valid details received for ${dogId}.`
      );
      return potentialDogData; // Return the valid dog object
    } else {
      console.warn(
        `Match API (Favorite Picker): Invalid or empty data received for dog ID ${dogId}.`
      );
      return null; // Return null if data is invalid or missing ID
    }
  } catch (error: any) {
    console.error(
      `fetchDogDetails: Error during POST to external /dogs for ID ${dogId}. Status: ${error.response?.status}.`,
      error.message
    );

    // Specific handling for 401 errors
    if (error.response?.status === 401) {
      console.error("fetchDogDetails: Authentication error (401)");
      console.error("Cookie present:", !!cookieHeader);
      if (cookieHeader) {
        // Check if both required cookies appear to be present (without exposing values)
        const hasFetchApiToken = cookieHeader.includes("fetch-api-token");
        const hasFetchRefreshToken = cookieHeader.includes(
          "fetch-refresh-token"
        );
        console.error(
          `API Token present: ${hasFetchApiToken}, Refresh Token present: ${hasFetchRefreshToken}`
        );
      }
    }

    return null; // Return null if fetching details fails
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    console.log("Match API: Invalid method:", req.method);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Expect the array directly, NOT wrapped in favoriteIds key
    const favoriteIds = req.body;

    // Get raw cookie header - critical for authentication
    const cookieHeader = req.headers.cookie;

    // Log all received cookies for debugging (without showing values)
    console.log(
      `Match API: Received cookies from client request: ${
        cookieHeader ? "Present" : "None"
      }`
    );

    if (cookieHeader) {
      // Check if both required cookies appear to be present (without exposing values)
      const hasFetchApiToken = cookieHeader.includes("fetch-api-token");
      const hasFetchRefreshToken = cookieHeader.includes("fetch-refresh-token");
      console.log(
        `Match API: API Token present: ${hasFetchApiToken}, Refresh Token present: ${hasFetchRefreshToken}`
      );
    }

    // Check for cookies
    if (!cookieHeader) {
      console.error("Match API: No cookies received in request");
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
      console.log("Match API: favoriteIds array is empty.");
      return res.status(400).json({
        message: "Cannot find a match from an empty favorites list.",
      });
    }

    console.log("Match API: Received favorite IDs:", favoriteIds);

    let dogIdToFetch: string | null = null;

    // 1. Try calling the external /dogs/match endpoint
    try {
      console.log(
        `Match API: Attempting POST to external /dogs/match with Cookie header present: ${!!cookieHeader}`
      );
      const matchResponse = await axios.post(
        "https://frontend-take-home-service.fetch.com/dogs/match",
        favoriteIds, // Send the array directly
        {
          headers: {
            Cookie: cookieHeader,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(
        "Match API: Response from external /dogs/match:",
        matchResponse.status
      );

      // Check if the response has a 'match' property with a valid ID
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
      console.log(
        "Match API: No specific match from external API or error occurred. Selecting random favorite."
      );
      const randomIndex = Math.floor(Math.random() * favoriteIds.length);
      dogIdToFetch = favoriteIds[randomIndex];
      console.log(`Match API: Randomly selected favorite ID: ${dogIdToFetch}`);
    }

    // Ensure dogIdToFetch is a non-null string before proceeding
    if (!dogIdToFetch || typeof dogIdToFetch !== "string") {
      console.error(
        "Match API: Failed to determine a valid dog ID to fetch details for."
      );
      return res.status(500).json({
        message: "Internal error: Could not determine dog ID for matching.",
      });
    }

    // 3. Fetch details for the chosen ID (now guaranteed to be a string)
    console.log(
      `Match API: Proceeding to fetch details for final ID: ${dogIdToFetch}`
    );
    const dogToReturn = await fetchDogDetails(dogIdToFetch, cookieHeader);

    // Handle case where fetching details failed
    if (!dogToReturn) {
      console.error(
        `Match API: fetchDogDetails returned null for ID: ${dogIdToFetch}.`
      );
      // Return 500 as it's an internal issue fetching details
      return res.status(500).json({
        message: `Could not retrieve details for dog ID: ${dogIdToFetch}.`,
      });
    }

    console.log("Match API: Successfully returning final dog details:", {
      id: dogToReturn.id,
      name: dogToReturn.name,
    });
    return res.status(200).json(dogToReturn);
  } catch (error: any) {
    console.error("Match API: Unexpected error in handler:", error);
    return res.status(500).json({
      message: "Internal server error processing match request.",
    });
  }
}
