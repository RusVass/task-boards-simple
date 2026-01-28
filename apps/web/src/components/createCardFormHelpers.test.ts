import { describe, expect, it } from "vitest";
import { buildCardPayload } from "./createCardFormHelpers";

describe("buildCardPayload", () => {
  it("returns null when title is empty after trim", () => {
    const result = buildCardPayload({ title: "   ", description: "text" });
    expect(result).toBeNull();
  });

  it("trims title and description", () => {
    const result = buildCardPayload({ title: "  Title  ", description: "  Desc  " });
    expect(result).toEqual({ title: "Title", description: "Desc" });
  });

  it("allows empty description after trim", () => {
    const result = buildCardPayload({ title: "Title", description: "   " });
    expect(result).toEqual({ title: "Title", description: "" });
  });
});
