type Obj<T> = Record<string, T>;
type Project = {
  title: string,
  prefix: string
};
type Operation = Obj<string[]>
interface Name {
  sep: [string, string, string];
  project: Project;
  operations: Obj<Operation[]>[];
}
type Names = Obj<Name>;
type FromT = string | Obj<any>;

export type Text = {
  text: string
}
export type Socket = Text & {
  prefix: string,
  suffix: string
}
export type Command = Socket & {
  subcommand: string,
  command: string
}
interface NameInterface {
  commands: Command[];
  sockets: Socket[];
  project: Project;
}
type Namespace = Obj<NameInterface>

const toT = (args: FromT[]) => {
  return args.map(obj => {
    if (typeof obj == "string") {
      return {key: obj, list: []}
    }
    const entries = Object.entries(obj);
    const [key, list] = entries.pop();
    let error = `${entries.length} extra entries`;
    if (entries.length === 0) {
      error = `${typeof list} value`;
      if (Array.isArray(list)) {
        return {key, list};
      }
    }
    const info = `Object with ${key} has ${error}`;
    const msg = `Invalid config: ${info}`;
    throw new Error(msg);
  });
}

const compare = (o1: Obj<any>, o2: Obj<any>) => {
  const keys = Object.keys(o1);
  return keys.every(k => o1[k] === o2[k]);
}

const unique = (ops: Obj<any>[], key: string) => {
  return ops.reduce((list: any[], op) => {
    const exists = list.some((val) => {
      return compare(op[key], val)
    })
    return exists ? list : [...list, op[key]]
  }, []);
}

const toNamespace = (names: Names): Namespace => {
  return Object.entries(names).reduce((o, [k, v]) => {
    const { sep, project, operations } = v;
    const n0 = project.prefix;
    const ops = toT(operations).reduce((l1, o1) => {
      const n1 = o1.key;
      return toT(o1.list).reduce((l2, o2) => {
        const n2 = o2.key;
          return toT(o2.list).reduce((l3, o3) => {
            const n3 = o3.key;
            const parts = [
              n0, sep[0], n1, sep[1], n2, sep[2], n3
            ];
            const command = {
              text: parts.join(''),
              prefix: parts.slice(0,3).join(''),
              suffix: parts.slice(3).join(''),
              subcommand: n3,
              command: n2
            };
            const socket = {
              text: parts.slice(0,3).join(''),
              prefix: project.prefix,
              suffix: n1
            };
            const details = {
              command, socket
            }
            return [...l3, details];
          }, l2);
      }, l1);
    }, []);
    const sockets = unique(ops, "socket");
    const commands = unique(ops, "command");
    const namespace = { commands, sockets, project };
    return {...o, [k]: namespace};
  }, {});
}

export {
  toNamespace
}
