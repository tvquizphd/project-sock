import { Project } from "./project";
import type { Command } from "./toNamespace";
export interface ToProjectInputs {
    commands?: Command[];
    delay?: number;
    limit?: number;
    token: string;
    owner: string;
    title: string;
}
declare const toProject: (inputs: ToProjectInputs) => Promise<void | Project>;
export { toProject };
