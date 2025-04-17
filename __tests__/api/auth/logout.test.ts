import { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import handler from "../../../pages/api/auth/logout";

jest.mock("axios", () => ({
  post: jest.fn(),
}));

import axios from "axios";
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Logout API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockReqRes(method: "GET" | "POST", cookies = {}, headers = {}) {
    return createMocks<NextApiRequest, NextApiResponse>({
      method,
      cookies,
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

  it("should handle logout with no cookies", async () => {
    const { req, res } = mockReqRes("POST");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        message: "Logged out successfully (no cookies)",
      })
    );

    // Verify cookies are cleared
    const cookies = res.getHeader("Set-Cookie") as string[];
    expect(cookies.length).toBe(2);
    expect(cookies[0]).toContain("fetch-api-token=");
    expect(cookies[0]).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    expect(cookies[1]).toContain("fetch-refresh-token=");
    expect(cookies[1]).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  });

  it("should handle successful logout with cookies", async () => {
    // Mock successful call to logout endpoint
    mockedAxios.post.mockResolvedValueOnce({});

    const { req, res } = mockReqRes(
      "POST",
      {
        "fetch-api-token": "test-token",
        "fetch-refresh-token": "test-refresh",
      },
      {
        cookie: "fetch-api-token=test-token; fetch-refresh-token=test-refresh",
      }
    );

    await handler(req, res);

    // Verify axios was called with cookies
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://frontend-take-home-service.fetch.com/auth/logout",
      {},
      expect.objectContaining({
        headers: expect.objectContaining({
          Cookie: expect.stringContaining("fetch-api-token=test-token"),
        }),
      })
    );

    // Verify response
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Logged out successfully",
    });

    // Verify cookies are cleared
    const cookies = res.getHeader("Set-Cookie") as string[];
    expect(cookies.length).toBe(2);
    expect(cookies[0]).toContain("fetch-api-token=");
    expect(cookies[0]).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  });

  it("should handle 401 from Fetch API as successful logout", async () => {
    // Mock 401 from backend (token already expired)
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 401,
      },
      message: "Unauthorized",
    });

    const { req, res } = mockReqRes("POST", {
      "fetch-api-token": "expired-token",
      "fetch-refresh-token": "expired-refresh",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Logged out successfully",
    });

    // Verify cookies are cleared
    const cookies = res.getHeader("Set-Cookie") as string[];
    expect(cookies.length).toBe(2);
  });

  it("should handle error from Fetch API but still log out client", async () => {
    // Mock network error
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 500,
      },
      message: "Server error",
    });

    const { req, res } = mockReqRes("POST", {
      "fetch-api-token": "some-token",
      "fetch-refresh-token": "some-refresh",
    });

    await handler(req, res);

    // Even with server error, should return 200 and clear cookies
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        message: "Logged out (with server error)",
      })
    );

    // Verify cookies are cleared
    const cookies = res.getHeader("Set-Cookie") as string[];
    expect(cookies.length).toBe(2);
  });
});
