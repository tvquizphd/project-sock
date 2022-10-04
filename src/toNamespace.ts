type Obj<T> = Record<string, T>;
type Project = {
  title: string,
  prefix: string
};
type Operation = Obj<string[]>
interface Name {
  sep: string;
  project: Project;
  operations: Obj<Operation[]>[];
}
type Names = Obj<Name>;
type FromT = string | Obj<any>;
type NodeT = {
  key: string,
  list: any[]
}
interface ToT {
  (i: FromT[]): NodeT[]
}
type Details = {
  command: Command,
  socket: Socket
}
interface Unpack {
  (v: Name): Details[]
}

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

const toT: ToT = (args) => {
  return args.map(obj => {
    if (typeof obj == "string") {
      return {key: obj, list: []}
    }
    const entries = Object.entries(obj);
    const [key, list] = entries.pop() || [];
    if (typeof key !== 'string') {
      const msg = `Invalid object: no entries`;
      throw new Error(msg);
    }
    if (entries.length !== 0) {
      const error = `${entries.length} extra entries`;
      const msg = `Invalid ${key}: ${error}`;
      throw new Error(msg);
    }
    if (!Array.isArray(list)) {
      const error = `${typeof list} value`;
      const msg = `Invalid ${key}: ${error}`;
      throw new Error(msg);
    }
    return {key, list};
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

const unpack: Unpack = (v) => {
  const n0 = v.project.prefix;
  const { sep, operations } = v;
  return toT(operations).reduce((l1, o1) => {
    const n1 = o1.key;
    return toT(o1.list).reduce((l2, o2) => {
      const n2 = o2.key;
        return toT(o2.list).reduce((l3, o3) => {
          const n3 = o3.key;
          const parts = [
            n0, sep, n1, "", n2, sep, n3
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
            prefix: n0,
            suffix: n1
          };
          const details = {
            command, socket
          }
          return [...l3, details];
        }, l2);
    }, l1);
  }, [] as Details[]);
}

const toNamespace = (names: Names): Namespace => {
  return Object.entries(names).reduce((o, [k, v]) => {
    const { project } = v;
    const ops = unpack(v);
    const sockets = unique(ops, "socket");
    const commands = unique(ops, "command");
    const namespace = { commands, sockets, project };
    return {...o, [k]: namespace};
  }, {});
}

export {
  toNamespace
}
