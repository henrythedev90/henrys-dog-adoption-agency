// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "",
      query: {},
      asPath: "",
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null),
    };
  },
}));

// Optional: Mock the Redux store if needed
// This is just an example - you'll need to adjust based on your store structure
/*
jest.mock('../src/store/hooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: jest.fn(),
}));
*/
