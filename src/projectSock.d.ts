import { ProjectChannel } from "./projectChannel";
import type { ToProjectInputs } from "./toProject";
import type { ProjectChannelInputs } from "./projectChannel";
export declare type ProjectSockInputs = (ToProjectInputs & ProjectChannelInputs);
interface SocketWrapper {
    sock: ProjectChannel;
    give: (o: string, t: string, m: string) => void;
    get: (o: string, t: string) => Promise<any>;
}
declare const toProjectSock: (inputs: ProjectSockInputs) => Promise<SocketWrapper>;
export { toProjectSock };
