import type { Command } from "./toNamespace";
declare type Resolver = (s: string) => void;
declare type Queued = () => Promise<void>;
declare type Item = {
    id: number;
    body: string;
    title: string;
};
declare type ClearArgs = {
    done?: boolean;
    commands?: Command[];
};
declare class Project {
    id: number;
    title: string;
    owner: string;
    done: boolean;
    items: Item[];
    octograph: any;
    number: number;
    max_time: number;
    call_fifo: Queued[];
    commands: Command[];
    waitMap: Map<string, Resolver>;
    constructor(inputs: any);
    get busy(): boolean;
    get itemObject(): Record<string, Item>;
    get commandObject(): Record<string, Command>;
    get hasCommands(): boolean;
    hasResponse(k: any): boolean;
    mainLoop(): Promise<void>;
    setItems({ items }: {
        items: any;
    }): void;
    resolver([k, resolve]: [any, any]): void;
    addItem(k: any, v: any): void;
    removeItem(k: any): void;
    awaitItem([k, resolve]: [any, any]): void;
    clear(clearArgs?: ClearArgs): Promise<unknown>;
    finish(): Promise<unknown>;
}
export { Project };
