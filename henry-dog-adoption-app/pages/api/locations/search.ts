import { NextApiRequest, NextApiResponse } from "next";
import { apiClient } from "@/services/apiClient";
import axios from "axios";

const route = "/locations/search";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Method validation with better error message
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      message: "This endpoint only accepts POST requests",
    });
  }

  // Authentication check first
  const cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "You need to be authenticated to access this resource",
    });
  }

  // Destructure with default values
  const { city, states, geoBoundingBox, size = 25, from = 0 } = req.body;

  // Validate input parameters
  if (states && !Array.isArray(states)) {
    return res.status(400).json({
      error: "Invalid parameter",
      message: "States must be an array of two-letter state codes",
    });
  }

  if (size && (typeof size !== "number" || size < 1 || size > 100)) {
    return res.status(400).json({
      error: "Invalid parameter",
      message: "Size must be a number between 1 and 100",
    });
  }

  // Validate geoBoundingBox
  if (geoBoundingBox) {
    const {
      top,
      left,
      bottom,
      right,
      bottom_left,
      top_right,
      bottom_right,
      top_left,
    } = geoBoundingBox;

    const hasTopLeftBottomRight =
      top !== undefined &&
      left !== undefined &&
      bottom !== undefined &&
      right !== undefined;
    const hasBottomLeftTopRight = bottom_left && top_right;
    const hasBottomRightTopLeft = bottom_right && top_left;

    if (
      !hasTopLeftBottomRight &&
      !hasBottomLeftTopRight &&
      !hasBottomRightTopLeft
    ) {
      return res.status(400).json({
        error: "Invalid geoBoundingBox",
        message:
          "geoBoundingBox must contain one of these combinations: 1) top, left, bottom, right; 2) bottom_left, top_right; or 3) bottom_right, top_left",
      });
    }

    // Validate coordinate values if provided
    if (
      bottom_left &&
      (typeof bottom_left.lat !== "number" ||
        typeof bottom_left.lon !== "number")
    ) {
      return res.status(400).json({
        error: "Invalid coordinates",
        message: "Coordinates must have numeric lat and lon values",
      });
    }
    // Add similar validation for other coordinate pairs
  }

  try {
    // Filter out undefined fields to keep the request clean
    const requestBody = {
      ...(city && { city }),
      ...(states && { states }),
      ...(geoBoundingBox && { geoBoundingBox }),
      size,
      from,
    };

    const response = await apiClient.post(route, requestBody, {
      headers: {
        Cookie: cookies,
      },
      timeout: 10000, // Add timeout to prevent hanging requests
    });

    return res.status(200).json(response.data);
  } catch (error) {
    // Improved error handling with more specific status codes
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorMessage = error.response?.data?.message || error.message;

      console.error(`Location search error (${status}):`, errorMessage);

      // Map common error status codes
      if (status === 401 || status === 403) {
        return res.status(status).json({
          error: "Authentication error",
          message: "Your session may have expired. Please log in again.",
        });
      } else if (status === 400) {
        return res.status(400).json({
          error: "Bad request",
          message: errorMessage,
        });
      }

      return res.status(status).json({
        error: "Search failed",
        message: errorMessage,
      });
    } else {
      console.error("Unexpected error:", (error as Error).message);
      return res.status(500).json({
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request",
      });
    }
  }
}
