import yargs from "yargs";
import { assert, expect } from "chai";
import { getFilesAsync } from "../src/utilities/file-helpers";

const ORIGIN = "http://localhost:8080";

const argv = yargs.option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run tests in verbose mode",
}).argv as { verbose: boolean };

describe("Client-server asset pipeline", () => {
    it("should properly return asset object", async () => {
        const files = await getFilesAsync(ORIGIN);
        
        if (argv.verbose) console.log(files);

        assert(files);
        expect(files).to.not.be.empty;
    });
});
