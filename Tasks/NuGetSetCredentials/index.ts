import { getInputValues } from "./input-values";
import { NuGetTool } from "./nuget-tool";
import * as tl from "vsts-task-lib/task";

async function main(): Promise<void> {
    const inputs = getInputValues();
    const tool = new NuGetTool();
    await tool.setCredentials(inputs.feedName, inputs.userName, inputs.password, inputs.nugetConfigFile);
}

main().catch(e =>
    tl.error(e)
);
