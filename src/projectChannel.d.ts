declare class ProjectChannel {
    scope: string;
    project: any;
    constructor(inputs: any);
    hasResponse(k: any): any;
    hasRequest(): boolean;
    toKey(op_id: any, tag: any): string;
    listenForKey(k: any, res: any): void;
    receiveMailKey(k: any, res: any): void;
    cacheMail(k: any, a: any): void;
    sendMail(k: any, a: any): void;
}
export { ProjectChannel };
