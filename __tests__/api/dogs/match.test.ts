import { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import handler from "../../../pages/api/dogs/match";

// Mock axios
jest.mock("axios", () => ({
  post: jest.fn(),
}));

import axios from "axios";
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Match API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockReqRes(
    method: "GET" | "POST" = "POST",
    body: any = [],
    headers: any = {}
  ) {
    return createMocks<NextApiRequest, NextApiResponse>({
      method,
      body,
      headers,
    });
  }

  it("should return 405 if method is not POST", async () => {
    const { req, res } = mockReqRes("GET");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ message: "Method not allowed" })
    );
  });

  it("should return 401 if cookies are missing", async () => {
    const { req, res } = mockReqRes("POST", ["dog1", "dog2"]);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        message: "Authentication cookies missing",
      })
    );
  });

  it("should return 400 if request body is not an array", async () => {
    const { req, res } = mockReqRes(
      "POST",
      { notAnArray: true },
      { cookie: "fetch-api-token=test-token" }
    );

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        message: "Invalid request body: favoriteIds must be an array.",
      })
    );
  });

  it("should return 400 if favorites array is empty", async () => {
    const { req, res } = mockReqRes("POST", [], {
      cookie: "fetch-api-token=test-token",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        message: "Cannot find a match from an empty favorites list.",
      })
    );
  });

  it("should return 401 if upstream authentication fails", async () => {
    // Mock 401 unauthorized from upstream API
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 401 },
      message: "Unauthorized",
    });

    const { req, res } = mockReqRes("POST", ["dog1", "dog2"], {
      cookie: "fetch-api-token=expired-token",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        message:
          "Authentication failed when contacting Fetch API. Please log in again.",
        error: "unauthorized",
      })
    );
  });

  it("should handle successful match with dog details", async () => {
    const mockDogId = "dog123";
    const mockDog = {
      id: mockDogId,
      name: "Buddy",
      breed: "Golden Retriever",
      age: 3,
      img: "https://example.com/dog.jpg",
    };

    // Mock successful match response
    mockedAxios.post.mockImplementation((url, data, config) => {
      if (url.includes("/dogs/match")) {
        return Promise.resolve({
          data: { match: mockDogId },
        });
      } else if (url.includes("/dogs")) {
        return Promise.resolve({
          data: [mockDog],
        });
      }
      return Promise.reject(new Error("Unrecognized URL"));
    });

    const { req, res } = mockReqRes("POST", ["dog1", "dog2"], {
      cookie: "fetch-api-token=valid-token",
    });

    await handler(req, res);

    // Verify first call to match API
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      1,
      "https://frontend-take-home-service.fetch.com/dogs/match",
      ["dog1", "dog2"],
      expect.objectContaining({
        headers: expect.objectContaining({
          Cookie: "fetch-api-token=valid-token",
        }),
      })
    );

    // Verify second call to get dog details
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      2,
      "https://frontend-take-home-service.fetch.com/dogs",
      [mockDogId],
      expect.objectContaining({
        headers: expect.objectContaining({
          Cookie: "fetch-api-token=valid-token",
        }),
      })
    );

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockDog);
  });

  it("should fall back to random favorite if match API fails", async () => {
    const favoriteIds = ["dog1", "dog2", "dog3"];
    const randomDogIndex = 1; // We'll ensure it picks dog2
    const mockDog = {
      id: "dog2",
      name: "Rex",
      breed: "German Shepherd",
      age: 2,
    };

    // Mock Math.random to return a predictable value
    const originalRandom = Math.random;
    Math.random = jest.fn().mockReturnValue(0.4); // Will select index 1 when multiplied by 3

    // Mock match API failure but successful dog fetch
    mockedAxios.post.mockImplementation((url, data, config) => {
      if (url.includes("/dogs/match")) {
        return Promise.reject(new Error("Match API failed"));
      } else if (url.includes("/dogs")) {
        // Successfully fetch dog details for the random selection
        return Promise.resolve({
          data: [mockDog],
        });
      }
      return Promise.reject(new Error("Unrecognized URL"));
    });

    const { req, res } = mockReqRes("POST", favoriteIds, {
      cookie: "fetch-api-token=valid-token",
    });

    await handler(req, res);

    // Should have fallen back to random favorite
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      2,
      "https://frontend-take-home-service.fetch.com/dogs",
      ["dog2"], // Should be the randomly selected dog
      expect.any(Object)
    );

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockDog);

    // Restore original Math.random
    Math.random = originalRandom;
  });

  it("should return 500 if dog details can't be fetched", async () => {
    // Mock successful match but failed dog details
    mockedAxios.post.mockImplementation((url, data, config) => {
      if (url.includes("/dogs/match")) {
        return Promise.resolve({
          data: { match: "dog123" },
        });
      } else if (url.includes("/dogs")) {
        // Return empty array (no dog found)
        return Promise.resolve({
          data: [],
        });
      }
      return Promise.reject(new Error("Unrecognized URL"));
    });

    const { req, res } = mockReqRes("POST", ["dog1", "dog2"], {
      cookie: "fetch-api-token=valid-token",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        message: "Could not retrieve details for dog ID: dog123.",
      })
    );
  });
});
