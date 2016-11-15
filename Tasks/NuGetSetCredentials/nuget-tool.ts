import * as tl from "vsts-task-lib/task";
import * as assert from "assert";
import * as path from "path";
import { platform } from "os";

const config = require("./config.json");

function getNuGetPath(version: string): string {
    assert(config.binaries.hasOwnProperty(version), `Version ${version} is not defined in config`);

    return path.join(__dirname, config.paths.binaries, "NuGet", version, "nuget.exe");
}

export class NuGetTool {
    private readonly path: string;
    private readonly defaultArgs: string[];

    constructor(version: string) {
        const nuGetPath = getNuGetPath(version);

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
