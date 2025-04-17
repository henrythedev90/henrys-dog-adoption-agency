import { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import handler from "../../../pages/api/dogs/breeds";

// Mock axios
jest.mock("axios", () => ({
  get: jest.fn(),
}));

import axios from "axios";
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Dog Breeds API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockReqRes(method: "GET" | "POST", headers = {}) {
    return createMocks<NextApiRequest, NextApiResponse>({
      method,
      headers,
    });
  }

  it("should return 405 if method is not GET", async () => {
    const { req, res } = mockReqRes("POST");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: "Method is not allowed",
        message: "Must use GET method",
      })
    );
  });

  it("should return 401 if cookies are missing", async () => {
    const { req, res } = mockReqRes("GET");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: "Missing authentication",
        message: "Cookies are missing",
      })
    );
  });

  it("should return dog breeds on successful request", async () => {
    const mockBreeds = ["Labrador", "German Shepherd", "Bulldog", "Poodle"];
    mockedAxios.get.mockResolvedValueOnce({
      data: mockBreeds,
    });

    const { req, res } = mockReqRes("GET", {
      cookie: "fetch-api-token=test-token; fetch-refresh-token=test-refresh",
    });

    await handler(req, res);

    // Verify axios was called correctly
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://frontend-take-home-service.fetch.com/dogs/breeds",
      expect.objectContaining({
        withCredentials: true,
        headers: expect.objectContaining({
          Cookie:
            "fetch-api-token=test-token; fetch-refresh-token=test-refresh",
        }),
      })
    );

    // Verify response
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockBreeds);
  });

  it("should handle API errors", async () => {
    // Mock API error
    mockedAxios.get.mockRejectedValueOnce(new Error("API connection error"));

    const { req, res } = mockReqRes("GET", {
      cookie: "fetch-api-token=test-token",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: "Failed to find the breeds",
        message: "API connection error",
      })
    );
  });
});
