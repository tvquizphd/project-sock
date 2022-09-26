import { ProjectChannel } from "./projectChannel";
import type { ToProjectInputs } from "./toProject";
export declare type ProjectSockInputs = ToProjectInputs & {
    scope: string;
};
interface SocketWrapper {
    sock: ProjectChannel;
    give: (o: string, t: string, m: string) => void;
    get: (o: string, t: string) => Promise<any>;
}
declare const toProjectSock: (inputs: ProjectSockInputs) => Promise<SocketWrapper>;
export { toProjectSock };
