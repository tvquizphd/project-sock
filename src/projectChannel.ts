import { toB64urlQuery, fromB64urlQuery } from "./b64url/index.js";

import type { NodeAny } from "./b64url/index.js"; 
import type { Project } from "./project.js"; 

type Fn = (a: NodeAny) => void;

export type ProjectChannelInputs = {
  project: Project,
  scope: string
}

const serialize = (data: NodeAny): string => {
  return toB64urlQuery({ data });
}

const deserialize = (str: string): NodeAny => {
  return fromB64urlQuery(str).data;
}

class ProjectChannel {
  scope: string;
  project: Project;
  constructor(inputs: ProjectChannelInputs) {
    const { project, scope } = inputs;
    this.project = project;
    this.scope = scope;
  }
  hasResponse(k: string) {
    return this.project.hasResponse(k)
  }
  toKey(op_id: string, tag: string) {
    const names = [this.scope, op_id, tag];
    return names.join('__');
  }
  listenForKey(k: string, res: Fn) {
    const resolve = (s: string) => res(deserialize(s));
    this.project.awaitItem([k, resolve]);
  }
  receiveMailKey(k: string, res: Fn) {
    const resolve = (s: string) => res(deserialize(s));
    this.project.resolver([k, resolve]);
  }
  sendMail(k: string, a: any) {
    this.project.addItem(k, serialize(a));
  }
}

export {
  ProjectChannel
}
