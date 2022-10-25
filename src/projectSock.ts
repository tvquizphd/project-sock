import { ProjectChannel } from "./projectChannel.js";
import { toProject } from "./toProject.js";

import type { ToProjectInputs } from "./toProject.js"; 

export type ProjectSockInputs = ToProjectInputs & {
  scope: string
}

export interface SocketWrapper {
  sock: ProjectChannel;
  give: (o: string, t: string, m: string) => void;
  get: (o: string, t: string) => Promise<any>;
}

interface SocketFunction {
  (s: ProjectChannel): SocketWrapper;
}

const socket: SocketFunction = (sock) => ({
  sock,
  get: (op_id, tag) => {
    return new Promise(function (resolve) {
      const k = sock.toKey(op_id, tag);
      if (!sock.hasResponse(k)) {
        sock.listenForKey(k, resolve);
      } else {
        sock.receiveMailKey(k, resolve);
      }
    });
  },
  give: (op_id, tag, msg) => {
    const k = sock.toKey(op_id, tag);
    sock.sendMail(k, msg);
  },
});

const toProjectSock = async (inputs: ProjectSockInputs) => {
  const { scope } = inputs;
  const project = await toProject(inputs);
  if (!project) {
    throw new Error("Unable to find project");
  }
  const inputs_1 = { scope, project };
  return socket(new ProjectChannel(inputs_1));
}

export {
  toProjectSock
}
