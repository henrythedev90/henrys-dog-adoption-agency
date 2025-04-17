import { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import handler from "../../../pages/api/auth/check";

describe("Check API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockReqRes(method: "GET" | "POST" = "GET", headers = {}) {
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
      expect.objectContaining({ error: "Method not allowed" })
    );
  });

  it("should return 401 if cookies are missing", async () => {
    const { req, res } = mockReqRes("GET"); // No cookies

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ error: "Not authenticated" })
    );
  });

  it("should return 200 if cookies are present", async () => {
    const { req, res } = mockReqRes("GET", {
      cookie: "fetch-api-token=test-token",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      message: "Cookies are present",
    });
  });
});
