import { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import handler from "../../../pages/api/dogs/search";

// Mock axios
jest.mock("axios", () => ({
  get: jest.fn(),
}));

import axios from "axios";
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Search API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockReqRes(
    method: "GET" | "POST" = "GET",
    headers: any = {},
    query: any = {}
  ) {
    return createMocks<NextApiRequest, NextApiResponse>({
      method,
      query,
      headers,
    });
  }

  it("should return 405 if method is not GET", async () => {
    const { req, res } = mockReqRes("POST");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: "Method not allowed",
        message: "Must use GET method",
      })
    );
  });

  it("should return 401 if cookies are missing", async () => {
    const { req, res } = mockReqRes(
      "GET",
      {}, // No cookies
      {
        breeds: ["Labrador", "Poodle"],
        zipCodes: ["12345"],
        ageMin: "1",
        ageMax: "5",
        size: "10",
        from: "0",
        sort: "asc",
      }
    );

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: "You are not authenticated",
        message: "Cookies were not received",
      })
    );
  });

  it("should handle query parameter transformation correctly", async () => {
    // Mock successful response
    mockedAxios.get.mockResolvedValue({
      data: { resultIds: ["dog1", "dog2"], total: 2 },
    });

    // Test with a mix of array and string parameters
    const { req, res } = mockReqRes(
      "GET",
      {
        cookie: "fetch-api-token=test-token",
      },
      {
        breeds: "Labrador,Poodle", // String format
        zipCodes: ["12345"], // Array format
        ageMin: "1",
        ageMax: "5",
        size: "10",
        from: "0",
        sort: "asc",
      }
    );

    await handler(req, res);

    // Verify axios was called with correct parameters
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://frontend-take-home-service.fetch.com/dogs/search",
      expect.objectContaining({
        params: expect.objectContaining({
          breeds: ["Labrador", "Poodle"], // Should be converted to array
          zipCodes: ["12345"],
          ageMin: "1",
          ageMax: "5",
          size: "10",
          from: "0",
          sort: "asc",
        }),
        headers: {
          Cookie: "fetch-api-token=test-token",
        },
      })
    );

    expect(res._getStatusCode()).toBe(200);
  });

  it("should return 200 with data from external API", async () => {
    const mockResponseData = {
      resultIds: ["dog1", "dog2", "dog3"],
      total: 3,
      next: "/dogs/search?from=3",
      prev: null,
    };

    mockedAxios.get.mockResolvedValue({
      data: mockResponseData,
    });

    const { req, res } = mockReqRes(
      "GET",
      {
        cookie: "fetch-api-token=test-token",
      },
      {
        size: "10",
        from: "0",
      }
    );

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockResponseData);
  });

  it("should pass through server error status codes", async () => {
    // Mock a 403 Forbidden response
    mockedAxios.get.mockRejectedValue({
      response: {
        status: 403,
        data: { message: "Access denied" },
      },
    });

    const { req, res } = mockReqRes(
      "GET",
      {
        cookie: "fetch-api-token=test-token",
      },
      { size: "10" }
    );

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403); // Should use the upstream status code
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: "Failed to fetch search results from external service",
        message: "Access denied",
      })
    );
  });

  it("should return 500 for generic errors", async () => {
    const errorMessage = "Network Error";
    mockedAxios.get.mockRejectedValue(new Error(errorMessage));

    const { req, res } = mockReqRes(
      "GET",
      {
        cookie: "fetch-api-token=test-token",
      },
      { size: "10" }
    );

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: "Failed to fetch search results from external service",
        message: errorMessage,
      })
    );
  });
});
