import { Project } from "./project";
import type { Command } from "./toNamespace";
export interface Inputs {
    commands?: Command[];
    token: string;
    owner: string;
    title: string;
}
declare const toProject: (inputs: any) => Promise<void | Project>;
export { toProject };
