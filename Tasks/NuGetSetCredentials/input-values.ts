import * as assert from "assert";
import * as tl from "vsts-task-lib/task";

/**
 * Helper for reading task.json.
 *
 * @interface TaskConfig
 */
interface TaskConfig {
    inputs: [{
        name: string;
        required: boolean;
    }];
}

const taskConfig = require("./task.json") as TaskConfig;

/**
 * The values of inputs from VSTS that our task needs.
 *
 * @export
 * @interface InputValues
 */
export interface InputValues {
    nugetConfigFile: string;
    feedName: string;
    userName: string;
    password: string;
}

export function getInputValues(): InputValues {
    return {
        nugetConfigFile: getInput("nugetConfigFile"),
        feedName: getInput("feedName"),
        userName: getInput("userName"),
        password: getInput("password")
    };
}

function getInput(name: string): string {
    const inputs = taskConfig.inputs.filter(i => i.name === name);
    assert(inputs.length === 1, `There should be exactly 1 input with name '${name}' in task.json, found ${inputs.length}`);

    const input = inputs[0];
    return tl.getInput(name, input.required);
}
