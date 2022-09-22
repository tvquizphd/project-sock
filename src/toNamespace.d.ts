declare type Obj<T> = Record<string, T>;
declare type Project = {
    title: string;
    prefix: string;
};
declare type Operation = Obj<string[]>;
interface Name {
    sep: [string, string, string];
    project: Project;
    operations: Obj<Operation[]>[];
}
declare type Names = Obj<Name>;
declare type Socket = {
    text: string;
    prefix: string;
    suffix: string;
};
declare type Command = Socket & {
    subcommand: string;
    command: string;
};
interface NameInterface {
    commands: Command[];
    sockets: Socket[];
    project: Project;
}
declare type Namespace = Obj<NameInterface>;
declare const toNamespace: (names: Names) => Namespace;
export { toNamespace };
