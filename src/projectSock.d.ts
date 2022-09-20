declare const toProjectSock: (inputs: any) => Promise<{
    sock: any;
    get: (op_id: any, tag: any) => Promise<unknown>;
    give: (op_id: any, tag: any, msg: any) => void;
}>;
export { toProjectSock };
