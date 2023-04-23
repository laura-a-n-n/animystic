import { assert, expect } from "chai";
import { getFilesAsync } from "@/utilities/file-helpers";

describe("Client-server asset pipeline", () => {
  it("should properly return asset object", async () => {
    const files = await getFilesAsync("http://localhost:8080");
    assert(files);
    expect(files).to.not.be.empty;
  });
});
