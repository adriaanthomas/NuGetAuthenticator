import { NuGetTool } from "../nuget-tool";
import { InputValues } from "../input-values";
import * as BBPromise from "bluebird";
import { join as joinPaths } from "path";
import { Builder as XmlBuilder } from "xml2js";
require("should");

const fs = BBPromise.promisifyAll(require("fs-extra")) as {
    // bluebird does not offer an easy way to get these definitions, so declare them here for now...
    readFileAsync(file: string | Buffer | number, options?: {
        encoding?: string;
        flag?: string;
    }): BBPromise<string>;

    writeFileAsync(file: string, data: string, options?: {
        encoding?: string;
        mode?: number;
        flag?: string;
    }): BBPromise<void>;

    ensureDirAsync(dir: string): BBPromise<void>;
};
const parseXmlAsync = BBPromise.promisify(require("xml2js").parseString) as (xml: string) => BBPromise<any>;

const WorkingDir = joinPaths(__dirname, "tmp");
const Inputs: InputValues = {
    nugetConfigFile: joinPaths(WorkingDir, "NuGet.config"),
    feedName: "myFeed",
    userName: "nugetUser",
    password: "myP4assw0rd!"
};

const PackageSources = [{
    clear: [""],
    add: [
        {"$": {key: "nuget.org", value: "https://www.nuget.org/api/v2/"}},
        {"$": {key: "myFeed", value: "https://my.feed.com/nuget"}}
    ]
}];

beforeEach(async function() {
    await fs.ensureDirAsync(WorkingDir);
    await createNuGetConfig(Inputs.nugetConfigFile);
});

describe("NuGetTool", () => {
    it("should set credentials in a NuGet.config file", async function() {
        const nuget = new NuGetTool();
        await nuget.setCredentials(Inputs.feedName, Inputs.userName, Inputs.password, Inputs.nugetConfigFile);

        const xml = await fs.readFileAsync(Inputs.nugetConfigFile);
        const newConfig = await parseXmlAsync(xml);

        newConfig.configuration.packageSources.should.deepEqual(PackageSources);

        const packageSourceCredentials = newConfig.configuration.packageSourceCredentials;
        const expectedPackageSourceCredentials = [{
            myFeed: [{
                add: [
                    {"$": {key: "Username", value: "nugetUser"}},
                    {"$": {key: "Password"}} // the value is encrypted so cannot check here
                ]
            }]
        }];
        packageSourceCredentials.should.containDeepOrdered(expectedPackageSourceCredentials);

        const passwordSettings = packageSourceCredentials[0].myFeed[0].add[1]["$"];
        passwordSettings.should.have.property("value");
        passwordSettings.value.length.should.be.greaterThan(0);
    });
});

async function createNuGetConfig(path: string) {
    const xml = new XmlBuilder().buildObject({
        configuration: {
            packageSources: PackageSources
        }
    });

    await fs.writeFileAsync(path, xml, {mode: 0o644});
}
