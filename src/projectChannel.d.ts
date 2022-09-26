import type { NodeAny } from "./b64url";
import type { Project } from "./project";
declare type Fn = (a: NodeAny) => void;
export declare type ProjectChannelInputs = {
    project: Project;
    scope: string;
};
declare class ProjectChannel {
    scope: string;
    project: Project;
    constructor(inputs: ProjectChannelInputs);
    hasResponse(k: string): boolean;
    toKey(op_id: string, tag: string): string;
    listenForKey(k: string, res: Fn): void;
    receiveMailKey(k: string, res: Fn): void;
    sendMail(k: string, a: any): void;
}
export { ProjectChannel };
