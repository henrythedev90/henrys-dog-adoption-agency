import { NextApiRequest, NextApiResponse } from "next";
import { getSessionUserId } from "@/utils/auth";
import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";

// Update MongoDB connection string to use local MongoDB
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = "AdoptionData";
const DOGS_COLLECTION = "dogs";

interface DogQuery {
  _id?: { $nin: any[] };
  size?: string;
  age?: { $gte: number; $lte: number };
  energy_level?: { $gte: number; $lte: number };
  barking_level?: { $gte: number; $lte: number };
  shedding_level?: { $gte: number; $lte: number };
  borough?: string;
  gender?: string;
  $or?: Array<{
    good_with_children?: boolean;
    good_with_other_dogs?: boolean;
    good_with_strangers?: boolean;
    good_with_other_animals?: boolean;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  let client;
  try {
    const userId = await getSessionUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    client = await MongoClient.connect(MONGO_URI);

    const db = client.db(DB_NAME);
    const preferences = req.query;

    // Build the query based on preferences
    const query: DogQuery = {};

    // Size preference
    if (preferences.size) {
      query.size = Array.isArray(preferences.size)
        ? preferences.size[0]
        : preferences.size;
    }

    // Age range
    if (preferences["ageRange[]"] && Array.isArray(preferences["ageRange[]"])) {
      try {
        const minAge = parseInt(preferences["ageRange[]"][0]);
        const maxAge = parseInt(preferences["ageRange[]"][1]);
        if (!isNaN(minAge) && !isNaN(maxAge)) {
          query.age = { $gte: minAge, $lte: maxAge };
        }
      } catch (error) {
        console.log(
          "Error parsing ageRange:",
          preferences["ageRange[]"],
          error
        );
      }
    }

    // Energy level - use range
    if (preferences.energy_level) {
      const energyLevel = parseInt(
        Array.isArray(preferences.energy_level)
          ? preferences.energy_level[0]
          : preferences.energy_level
      );
      if (!isNaN(energyLevel)) {
        query.energy_level = {
          $gte: Math.max(1, energyLevel - 1),
          $lte: Math.min(5, energyLevel + 1),
        };
      }
    }

    // Barking level - use range
    if (preferences.barking_level) {
      const barkingLevel = parseInt(
        Array.isArray(preferences.barking_level)
          ? preferences.barking_level[0]
          : preferences.barking_level
      );
      if (!isNaN(barkingLevel)) {
        query.barking_level = {
          $gte: Math.max(1, barkingLevel - 1),
          $lte: Math.min(5, barkingLevel + 1),
        };
      }
    }

    // Shedding level - use range
    if (preferences.shedding_level) {
      const sheddingLevel = parseInt(
        Array.isArray(preferences.shedding_level)
          ? preferences.shedding_level[0]
          : preferences.shedding_level
      );
      if (!isNaN(sheddingLevel)) {
        query.shedding_level = {
          $gte: Math.max(1, sheddingLevel - 1),
          $lte: Math.min(5, sheddingLevel + 1),
        };
      }
    }

    // Borough preference
    if (preferences.borough) {
      const borough = (
        Array.isArray(preferences.borough)
          ? preferences.borough[0]
          : preferences.borough
      ).toUpperCase();
      query.borough = borough === "STATEN ISLAND" ? "STATEN_ISLAND" : borough;
    }

    // Gender preference
    if (preferences.gender && preferences.gender !== "any") {
      query.gender = Array.isArray(preferences.gender)
        ? preferences.gender[0]
        : preferences.gender;
    }

    // Compatibility preferences - make them optional
    const compatibilityQuery = [];
    if (preferences.good_with_children === "true") {
      compatibilityQuery.push({ good_with_children: true });
    }
    if (preferences.good_with_other_dogs === "true") {
      compatibilityQuery.push({ good_with_other_dogs: true });
    }
    if (preferences.good_with_strangers === "true") {
      compatibilityQuery.push({ good_with_strangers: true });
    }
    if (preferences.good_with_other_animals === "true") {
      compatibilityQuery.push({ good_with_other_animals: true });
    }

    if (compatibilityQuery.length > 0) {
      query.$or = compatibilityQuery;
    }

    // Get suggested dogs with scoring
    const pipeline = [
      { $match: query },
      {
        $addFields: {
          matchScore: {
            $add: [
              // Age match (weight: 4)
              {
                $cond: [
                  {
                    $and: [
                      { $ifNull: [preferences["ageRange[]"], false] },
                      {
                        $gte: [
                          "$age",
                          {
                            $toInt: {
                              $arrayElemAt: [
                                preferences["ageRange[]"] || ["0", "15"],
                                0,
                              ],
                            },
                          },
                        ],
                      },
                      {
                        $lte: [
                          "$age",
                          {
                            $toInt: {
                              $arrayElemAt: [
                                preferences["ageRange[]"] || ["0", "15"],
                                1,
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                  4,
                  0,
                ],
              },
              // Energy level match (weight: 3)
              {
                $multiply: [
                  3,
                  {
                    $subtract: [
                      5,
                      {
                        $abs: {
                          $subtract: [
                            "$energy_level",
                            parseInt(preferences.energy_level as string) || 0,
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              // Barking level match (weight: 2)
              {
                $multiply: [
                  2,
                  {
                    $subtract: [
                      5,
                      {
                        $abs: {
                          $subtract: [
                            "$barking_level",
                            parseInt(preferences.barking_level as string) || 0,
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              // Shedding level match (weight: 2)
              {
                $multiply: [
                  2,
                  {
                    $subtract: [
                      5,
                      {
                        $abs: {
                          $subtract: [
                            "$shedding_level",
                            parseInt(preferences.shedding_level as string) || 0,
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
              // Compatibility bonuses
              {
                $cond: [
                  {
                    $eq: [
                      "$good_with_children",
                      preferences.good_with_children === "true",
                    ],
                  },
                  1,
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $eq: [
                      "$good_with_other_dogs",
                      preferences.good_with_other_dogs === "true",
                    ],
                  },
                  1,
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $eq: [
                      "$good_with_strangers",
                      preferences.good_with_strangers === "true",
                    ],
                  },
                  1,
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $eq: [
                      "$good_with_other_animals",
                      preferences.good_with_other_animals === "true",
                    ],
                  },
                  1,
                  0,
                ],
              },
            ],
          },
        },
      },
      { $sort: { matchScore: -1 } },
      { $limit: 20 },
    ];

    const dogs = await db
      .collection(DOGS_COLLECTION)
      .aggregate(pipeline)
      .toArray();

    console.log("Number of dogs found:", dogs.length);
    if (dogs.length > 0) {
      // Store suggested dog IDs in user's document, maintaining a limit of 20
      const suggestedDogIds = dogs.map((dog) => dog._id);
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            suggested: suggestedDogIds, // Replace the entire array with new suggestions
          },
        }
      );
    }

    await client.close();
    return res.status(200).json(dogs);
  } catch (error) {
    console.error("Error in suggested dogs API:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
