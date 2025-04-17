import { render } from "@testing-library/react";
import SplitColorText from "./SplitColorText";

// Mock the CSS module
jest.mock("./styles/SplitColorText.module.css", () => ({
  split_text: "split_text",
  letter: "letter",
  size_small: "size_small",
  size_medium: "size_medium",
  size_large: "size_large",
}));

describe("SplitColorText Component", () => {
  it("renders the text correctly", () => {
    const { container } = render(<SplitColorText text="Hello" />);

    // Check that the container has the right number of letter spans
    const letterSpans = container.querySelectorAll(".letter");
    expect(letterSpans.length).toBe(5); // "Hello" has 5 characters

    // Check the text content of the entire component
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement.textContent).toBe("Hello");
  });

  it("renders with the correct tag", () => {
    const { container } = render(<SplitColorText text="Test" tag="h1" />);
    const h1Element = container.querySelector("h1");
    expect(h1Element).not.toBeNull();
  });

  it("renders with the correct size class", () => {
    const { container } = render(<SplitColorText text="Test" size="large" />);
    const element = container.firstChild as HTMLElement;
    expect(element.className).toContain("size_large");
  });

  it("handles spaces correctly", () => {
    const text = "The Fetch Adoption Center";
    const { container } = render(<SplitColorText text={text} />);

    // Get all letter spans
    const letterSpans = container.querySelectorAll(".letter");

    // The component should create one span for each character (including spaces)
    expect(letterSpans.length).toBe(text.length);

    // Check that the full text content matches
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement.textContent).toBe(text);

    // Verify that spaces are rendered as separate spans
    // Find the indices of spaces in the original text
    const spaceIndices = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === " ") spaceIndices.push(i);
    }

    // Check that we have spans for spaces
    spaceIndices.forEach((index) => {
      expect(letterSpans[index].textContent).toBe(" ");
    });
  });
});
