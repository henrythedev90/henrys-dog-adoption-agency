import { NextApiResponse, NextApiRequest } from "next";
import clientPromise from "@/lib/mongodb";
import { CollationOptions } from "mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Disable caching
  res.setHeader("Cache-Control", "no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ error: "Method not allowed", message: "Must use GET method" });
  }

  try {
    const {
      breeds,
      zipCodes,
      boroughs,
      ageMin,
      ageMax,
      size = 25,
      from = 0,
      sort,
    } = req.query;

    const client = await clientPromise;
    const db = client.db("AdoptionData");

    // Build MongoDB query
    // Using 'any' here is pragmatic for dynamic MongoDB queries
    // If your linter still complains, you may need to disable the rule for this line
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    // Add breed filter with validation
    if (breeds) {
      const breedsArray = Array.isArray(breeds)
        ? breeds
        : breeds.split(",").map((breed: string) => breed.trim());

      // Validate breeds
      if (breedsArray.some((breed) => !breed)) {
        return res.status(400).json({
          error: "Invalid breed format",
          message: "Breeds cannot be empty",
        });
      }

      query.breed = { $in: breedsArray };
    }

    // Add borough filter with validation
    if (boroughs) {
      const boroughArray = Array.isArray(boroughs)
        ? boroughs
        : boroughs.split(",").map((borough: string) => {
            const trimmed = borough.trim().toUpperCase();
            // Convert "STATEN ISLAND" to "STATEN_ISLAND"
            return trimmed === "STATEN ISLAND" ? "STATEN_ISLAND" : trimmed;
          });

      // Validate boroughs
      if (boroughArray.some((borough) => !borough)) {
        return res.status(400).json({
          error: "Invalid borough format",
          message: "Boroughs cannot be empty",
        });
      }

      // Log the borough values for debugging
      console.log("Search API: Borough filter values:", {
        requestedBoroughs: boroughArray,
        query: { borough: { $in: boroughArray } },
      });

      // Get a sample of boroughs from the database to verify values
      const sampleDogs = await db
        .collection("dogs")
        .find({})
        .limit(5)
        .toArray();
      console.log(
        "Search API: Sample boroughs from database:",
        sampleDogs.map((dog) => dog.borough)
      );

      query.borough = { $in: boroughArray };
    }

    // Add zip code filter with validation
    if (zipCodes) {
      const zipArray = Array.isArray(zipCodes)
        ? zipCodes
        : zipCodes.split(",").map((zip: string) => zip.trim());

      // Validate zip codes (basic format check)
      const zipRegex = /^\d{5}$/;
      if (zipArray.some((zip) => !zipRegex.test(zip))) {
        return res.status(400).json({
          error: "Invalid zip code format",
          message: "Zip codes must be 5 digits",
        });
      }

      query.zip_code = { $in: zipArray };
    }

    // Add age range filter with validation
    if (ageMin || ageMax) {
      query.age = {};
      if (ageMin) {
        const minAge = parseInt(ageMin as string);
        if (isNaN(minAge) || minAge < 0) {
          return res.status(400).json({
            error: "Invalid age range",
            message: "Minimum age must be a positive number",
          });
        }
        query.age.$gte = minAge;
      }
      if (ageMax) {
        const maxAge = parseInt(ageMax as string);
        if (isNaN(maxAge) || maxAge < 0) {
          return res.status(400).json({
            error: "Invalid age range",
            message: "Maximum age must be a positive number",
          });
        }
        query.age.$lte = maxAge;
      }
    }

    // Build sort object
    const sortObj: Record<string, 1 | -1> = {};
    let collation: CollationOptions | undefined = undefined;
    if (sort) {
      const [field, order] = (sort as string).split(":");
      const validFields = ["age", "breed", "zip_code", "name", "borough"];
      const validOrders = ["asc", "desc"];

      if (!validFields.includes(field) || !validOrders.includes(order)) {
        return res.status(400).json({
          error: "Invalid sort parameters",
          message: `Sort field must be one of: ${validFields.join(
            ", "
          )} and order must be asc or desc`,
        });
      }

      sortObj[field] = order === "asc" ? 1 : -1;

      // Add collation for string fields
      if (field !== "age") {
        collation = {
          locale: "en",
          strength: 2, // Case-insensitive comparison
          alternate: "shifted", // Handle special characters
        };
      }
    }

    try {
      // Execute query with pagination
      let mongoQuery = db.collection("dogs").find(query);

      if (collation) {
        mongoQuery = mongoQuery.collation(collation);
      }

      const dogs = await mongoQuery
        .sort(sortObj)
        .skip(parseInt(from as string))
        .limit(parseInt(size as string))
        .toArray();

      // Get total count for pagination
      const total = await db.collection("dogs").countDocuments(query);

      const fromNum = parseInt(from as string);
      const sizeNum = parseInt(size as string);

      // Extract IDs for the response
      const resultIds = dogs.map((dog) => {
        if (!dog._id) {
          console.error("Dog missing _id:", dog);
          throw new Error("Dog document missing _id field");
        }
        return dog._id.toString();
      });

      const response = {
        resultIds,
        total,
        next: fromNum + sizeNum < total ? fromNum + sizeNum : undefined,
        prev: fromNum > 0 ? fromNum - sizeNum : undefined,
        filters: {
          breeds: breeds
            ? Array.isArray(breeds)
              ? breeds
              : breeds.split(",")
            : undefined,
          zipCodes: zipCodes
            ? Array.isArray(zipCodes)
              ? zipCodes
              : zipCodes.split(",")
            : undefined,
          boroughs: boroughs
            ? Array.isArray(boroughs)
              ? boroughs
              : boroughs.split(",")
            : undefined,
          ageRange: ageMin || ageMax ? { min: ageMin, max: ageMax } : undefined,
        },
      };

      return res.status(200).json(response);
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      return res.status(500).json({
        error: "Database operation failed",
        message:
          dbError instanceof Error ? dbError.message : "Unknown database error",
        details: dbError instanceof Error ? dbError.stack : undefined,
      });
    }
  } catch (error: unknown) {
    console.error("Error in search handler:", error);
    return res.status(500).json({
      error: "Failed to fetch search results",
      message: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof Error ? error.stack : undefined,
    });
  }
}
