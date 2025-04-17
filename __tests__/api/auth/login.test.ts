import { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import handler from "../../../pages/api/auth/login";

// Mock axios
jest.mock("axios", () => ({
  post: jest.fn(),
}));

import axios from "axios";
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Login API", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // Helper to create mock req/res
  function mockReqRes(method: "GET" | "POST", body = {}) {
    return createMocks<NextApiRequest, NextApiResponse>({
      method,
      body,
    });
  }

  it("should return 405 if method is not POST", async () => {
    const { req, res } = mockReqRes("GET");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: "Method is not allowed" })
    );
  });

  it("should return 400 if email is missing", async () => {
    const { req, res } = mockReqRes("POST", { name: "Test User" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ message: "Please enter a valid email" })
    );
  });

  it("should return 400 if email is invalid", async () => {
    const { req, res } = mockReqRes("POST", {
      name: "Test User",
      email: "invalid-email",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ message: "Please enter a valid email" })
    );
  });

  it("should return 400 if name is missing", async () => {
    const { req, res } = mockReqRes("POST", {
      email: "test@example.com",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ message: "Please enter a valid name" })
    );
  });

  it("should return 200 and set cookies for successful login", async () => {
    const mockCookies = [
      "fetch-api-token=abc123; Path=/; HttpOnly",
      "fetch-refresh-token=xyz789; Path=/; HttpOnly",
    ];

    // Mock the axios response
    mockedAxios.post.mockResolvedValueOnce({
      headers: {
        "set-cookie": mockCookies,
      },
    });

    const { req, res } = mockReqRes("POST", {
      name: "Test User",
      email: "test@example.com",
    });

    await handler(req, res);

    // Verify axios was called correctly
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://frontend-take-home-service.fetch.com/auth/login",
      { name: "Test User", email: "test@example.com" },
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
      })
    );

    // Verify response
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      message: "Login successful",
      user: { name: "Test User", email: "test@example.com" },
    });

    // Verify cookies are set
    expect(res.getHeader("Set-Cookie")).toEqual(mockCookies);
  });

  it("should return 401 if no cookies received from auth service", async () => {
    // Mock the axios response with no cookies
    mockedAxios.post.mockResolvedValueOnce({
      headers: {},
    });

    const { req, res } = mockReqRes("POST", {
      name: "Test User",
      email: "test@example.com",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: "Authentication failed",
        message: "No authentication cookies received from server",
      })
    );
  });

  it("should return error status from API if login fails", async () => {
    // Mock a failed axios response
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 403,
        data: { message: "Invalid credentials" },
      },
    });

    const { req, res } = mockReqRes("POST", {
      name: "Test User",
      email: "test@example.com",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Failed to login",
      message: "Invalid credentials",
    });
  });

  it("should return 500 if API call fails without response", async () => {
    // Mock a network error
    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

    const { req, res } = mockReqRes("POST", {
      name: "Test User",
      email: "test@example.com",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: "Failed to login",
      message: "Network error",
    });
  });
});
