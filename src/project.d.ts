import type { Text, Command } from "./toNamespace";
declare type Resolver = (s: string) => void;
declare type Queued = () => Promise<void>;
declare type HasId = Record<"id", number>;
declare type Content = {
    title: string;
    body: string;
};
declare type ClearArgs = {
    done?: boolean;
    commands?: Text[];
};
declare type Item = HasId & Content;
declare type HasItems = Record<"items", Item[]>;
declare type ToResolve = [string, (s: string) => void];
export declare type ProjectInputs = HasId & {
    number: number;
    owner: string;
    octograph: any;
    title: string;
    limit?: number;
    delay?: number;
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
    interval: number;
    call_fifo: Queued[];
    commands: Command[];
    waitMap: Map<string, Resolver>;
    constructor(inputs: ProjectInputs);
    get itemObject(): Record<string, Item>;
    get commandObject(): Record<string, Command>;
    get hasCommands(): boolean;
    hasResponse(k: string): boolean;
    mainLoop(): Promise<void>;
    setItems({ items }: HasItems): void;
    resolver([k, resolve]: ToResolve): void;
    addItem(k: string, v: string): void;
    awaitItem([k, resolve]: ToResolve): void;
    clearItems(items: Item[], clearArgs?: ClearArgs): Promise<unknown>;
    clear(clearArgs?: ClearArgs): Promise<unknown>;
    finish(): Promise<unknown>;
}
export { Project };
