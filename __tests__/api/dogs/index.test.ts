import { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";
import handler from "../../../pages/api/dogs";

jest.mock("axios", () => ({
  post: jest.fn(),
}));

import axios from "axios";
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Dogs Index API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
      expect.objectContaining({
        error: "This method is not allowed",
        message: "Must use the POST method",
      })
    );
  });

  it("should return 401 if cookies are missing", async () => {
    const { req, res } = mockReqRes("POST");

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: "You do have access because you are not authenticated",
        message: "Cookies are missing",
      })
    );
  });
  it("should return 400 if no dog IDs are provided", async () => {
    const { req, res } = mockReqRes("POST", { dogs: [] });
    req.headers = { cookie: "fetch-api-token=test-token" };

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: "There are no dogs here",
        message: "Please add at least 1 dogs",
      })
    );
  });
  it("should return 400 if too many dogs are provided", async () => {
    const { req, res } = mockReqRes("POST", Array(101).fill(1));
    req.headers = { cookie: "fetch-api-token=test-token" };
    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: "Too many dogs are being sent",
        message: "Please use 100 dogs or less.",
      })
    );
  });

  it("should return 400 if dogIds is not an array", async () => {
    const { req, res } = mockReqRes("POST", { dogIds: "not an array" });
    req.headers = { cookie: "fetch-api-token=test-token" };
    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        message: "Please add at least 1 dogs",
      })
    );
  });

  it("should return 200 with valid dog IDs", async () => {
    const mockResponse = [
      {
        id: "123",
        name: "Buddy",
        breed: "Labrador",
        age: 3,
        zip_code: "12345",
        img: "https://example.com/dog.jpg",
      },
    ];
    mockedAxios.post.mockResolvedValue({ data: mockResponse });

    const { req, res } = mockReqRes("POST");
    req.headers = { cookie: "fetch-api-token=test-token" };
    req.body = [1, 2, 3];

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://frontend-take-home-service.fetch.com/dogs",
      [1, 2, 3],
      expect.objectContaining({
        withCredentials: true,
        headers: {
          Cookie: "fetch-api-token=test-token",
        },
      })
    );
  });

  it("should return 500 for generic errors", async () => {
    const errorMessage = "Network Error";
    mockedAxios.post.mockRejectedValue(new Error(errorMessage));

    const { req, res } = mockReqRes("POST");
    req.headers = { cookie: "fetch-api-token=test-token" };
    req.body = [1, 2, 3];

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: "Failed to fetch the dog id's",
        message: errorMessage,
      })
    );
  });
});
