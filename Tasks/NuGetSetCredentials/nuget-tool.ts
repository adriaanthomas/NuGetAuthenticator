import * as tl from "vsts-task-lib/task";
import * as assert from "assert";
import * as path from "path";
import { platform } from "os";

const config = require("./config.json");

// For now, can become parameter later.
// Note that version 3.3.0 seriously messes up the config file,
// so we will just stick to a version that we know works.
const NuGetVersion = "3.4.4";

function getNuGetPath(): string {
    assert(config.binaries.hasOwnProperty(NuGetVersion), `Version ${NuGetVersion} is not defined in config`);

    return path.join(__dirname, config.paths.binaries, "NuGet", NuGetVersion, "nuget.exe");
}

export class NuGetTool {
    private readonly path: string;
    private readonly defaultArgs: string[];

    constructor() {
        const nuGetPath = getNuGetPath();

        if (!/^win/.test(platform())) {
            // not on Windows; run nuget on mono - fail if mono is not in the system path
            this.path = tl.which("mono", true);
            this.defaultArgs = [nuGetPath];
        } else {
            this.path = nuGetPath;
            this.defaultArgs = [];
        }
    }

    async setCredentials(feedName: string, userName: string, password: string, configFile: string): Promise<void> {
        await this.run([
            "sources", "Update",
            "-Name", feedName,
            "-UserName", userName,
            "-Password", password,
            "-ConfigFile", configFile,
            "-NonInteractive",
            "-Verbosity", "detailed"
        ]);
    }

    private async run(args: string[]): Promise<void> {
        // create a new runner in case caller reuses this instance
        const runner = tl.tool(this.path);
        runner.arg(this.defaultArgs.concat(args));
        const exitCode = await runner.exec();
        if (exitCode !== 0) {
            throw new Error(`NuGet exited with non-zero exit code: ${exitCode}`);
        }
    }
}
