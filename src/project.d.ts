declare type Resolver = (s: string) => void;
declare type Queued = () => Promise<void>;
declare type Item = {
    id: number;
    body: string;
    title: string;
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
    waitMap: Map<string, Resolver>;
    constructor(inputs: any);
    get busy(): boolean;
    get itemObject(): Record<string, Item>;
    hasResponse(k: any): boolean;
    mainLoop(): Promise<void>;
    setItems({ items }: {
        items: any;
    }): void;
    resolver([k, resolve]: [any, any]): void;
    addItem(k: any, v: any): void;
    removeItem(k: any): void;
    awaitItem([k, resolve]: [any, any]): void;
    clear(done?: boolean): Promise<void>;
    finish(): Promise<void>;
}
export { Project };
