import { NuGetTool } from "../nuget-tool";
import { InputValues } from "../input-values";
import { create as createXml } from "xmlbuilder";
import * as BBPromise from "bluebird";
import { join as joinPaths } from "path";

const fs = BBPromise.promisifyAll(require("fs-extra")) as {
    // bluebird does not offer an easy way to get these definitions, so declare them here for now...
    writeFileAsync(file: string, data: string, options?: {
        encoding?: string;
        mode?: number;
        flag?: string;
    }): BBPromise<void>;

    ensureDirAsync(dir: string): BBPromise<void>;
};

const WorkingDir = joinPaths(__dirname, "tmp");
const Inputs: InputValues = {
    nugetConfigFile: joinPaths(WorkingDir, "NuGet.config"),
    feedName: "myFeed",
    userName: "nugetUser",
    password: "myP4assw0rd!"
};

beforeEach(async function() {
    await fs.ensureDirAsync(WorkingDir);
    await createNuGetConfig(Inputs.nugetConfigFile);
});

describe("NuGetTool", () => {
    it("should set credentials in a NuGet.config file", async function() {
        const nuget = new NuGetTool();
        await nuget.setCredentials(Inputs.feedName, Inputs.userName, Inputs.password, Inputs.nugetConfigFile);
    });
});

async function createNuGetConfig(path: string) {
    const configuration = createXml("configuration", {encoding: "utf-8"});
    const packageSources = configuration.ele("packageSources");
    packageSources.ele("clear");
    packageSources.ele("add", {
        key: "nuget.org",
        value: "https://www.nuget.org/api/v2/"
    });
    packageSources.ele("add", {
        key: Inputs.feedName,
        value: "https://my.feed.com/nuget"
    });
    const xml = configuration.end({
        pretty: true
    });

    await fs.writeFileAsync(path, xml, {mode: 0o644});
}
