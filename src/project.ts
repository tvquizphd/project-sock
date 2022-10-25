import type { Text, Command } from "./toNamespace.js";

type Resolver = (s: string) => void;
type Queued = () => Promise<void>;

type HasId = Record<"id", string>;
type Content = {
  title: string,
  body: string
}
type HasContent = HasId & {
  content: Content;
}
type ClearArgs = {
  done?: boolean,
  commands?: Text[]
}
type FetchInputs = {
  owner: string,
  number: number,
  octograph: any
}
interface FetchItems {
  (i: FetchInputs): Promise<Item[]>
}
type SeekInputs = FetchInputs & {
  interval: number,
}
interface SeekItems {
  (i: SeekInputs): Promise<Item[]>
}
type RemoveInputs = HasId & {
  itemId: string,
  octograph: any
}
interface RemoveItem {
  (i: RemoveInputs): Promise<HasId>
}
type Item = HasId & Content;
type AddInputs = Item & {
  octograph: any
}
interface AddItem {
  (i: AddInputs): Promise<Item>
}

type VoidP = Promise<void>
type HasItems = Record<"items", Item[]>
type ToResolve = [string, (s: string) => void]

export type ProjectInputs = HasId & {
 number: number,
 owner: string,
 octograph: any,
 title: string,
 limit?: number,
 delay?: number,
 commands?: Command[]
}

const addItem: AddItem = async (inputs) => {
  const { octograph, title, body, id } = inputs;
  const add_in = { p: id, t: title, b: body };
  const n = (await octograph(`
    mutation($p: ID!, $t: String!, $b: String!) {
      addProjectV2DraftIssue(input: {projectId: $p, title: $t, body: $b}) {
        projectItem {
          id,
          content {
            ... on DraftIssue {
              title,
              body,
              id
            }
          }
        }
      }
    }
  `, add_in));
  return {
    ...n.content,
    id: n.id
  };
}

const removeItem: RemoveItem = async (inputs) => {
  const { octograph, itemId, id } = inputs;
  const delete_in = { p: id, i: itemId };
  const n = (await octograph(`
  mutation($p: ID!, $i: ID!) {
    deleteProjectV2Item( input: {projectId: $p, itemId: $i} ) {
      deletedItemId
    }
  }`, delete_in));
  return {
    id: n.deletedItemId
  };
}

const fetchItems: FetchItems = async (inputs) => {
  const { octograph } = inputs;
  const { nodes } = (await octograph(`
    query($owner: String!, $number: Int!) {
      user(login: $owner){
        projectV2(number: $number) {
          items(first: 100) {
            nodes {
              id,
              content {
                ... on DraftIssue {
                  title,
                  body
                }
              }
            }
          }
        }
      }
    }
  `, inputs)).user.projectV2.items;
  return nodes.map((n: HasContent) => {
    return {
      ...n.content,
      id: n.id
    }
  });
}

const seekItems: SeekItems = (inputs) => {
  const { interval } = inputs;
  const dt = 1000 * interval;
  return new Promise((resolve) => {
    setTimeout(async () => {
      const result = await fetchItems(inputs);
      resolve(result);
    }, dt);
  });
}

class Project {

  id: string;
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

  constructor(inputs: ProjectInputs) {
    const {
       id, number, owner, octograph, title
    } = inputs
    this.commands = inputs.commands || [];
    this.max_time = inputs.limit || 15 * 60;
    this.interval = inputs.delay || 1;
    this.id = id;
    this.title = title;
    this.owner = owner;
    this.number = number;
    this.octograph = octograph;
    this.waitMap = new Map();
    this.call_fifo = [];
    this.done = false;
    this.items = [];
    this.mainLoop();
  }

  get itemObject(): Record<string, Item> {
    return this.items.reduce((o, i) => {
      return {...o, [i.title]: i};
    }, {})
  }

  get commandObject(): Record<string, Command> {
    return this.commands.reduce((o, c) => {
      return {...o, [c.text]: c};
    }, {})
  }

  get hasCommands() {
    return this.commands.length > 0;
  }

  hasResponse(k: string) {
    return k in this.itemObject;
  }

  async mainLoop() {
    const inputs = {
      owner: this.owner,
      number: this.number,
      interval: this.interval,
      octograph: this.octograph
    }
    while (!this.done) {
      // Add or remove
      if (this.call_fifo.length > 0) {
        const queued = this.call_fifo.shift();
        await (queued as Queued)();
      }
      // Receive
      else {
        const items = await seekItems(inputs);
        this.setItems({ items });
      }
    }
  }

  setItems({ items }: HasItems) {
    if (this.hasCommands) {
      const { commandObject } = this;
      this.items = items.filter((item) => {
        return item.title in commandObject;
      });
    }
    else {
      this.items = items;
    }
    // Resolve all awaited messages
    const resolver = this.resolver.bind(this);
    [...this.waitMap].forEach(resolver);
  }

  resolver([k, resolve]: ToResolve) {
    const itemObject = this.itemObject;
    if (k in itemObject) {
      const { body } = itemObject[k];
      console.log(`Resolving ${k}`);
      if (this.waitMap.has(k)) {
        this.waitMap.delete(k);
      }
      const commands = [{ text: k }];
      const clearArgs = { commands };
      const finish = () => resolve(body);
      this.clear(clearArgs).then(finish);
    }
  }

  addItem(k: string, v: string) {
    const { octograph, id } = this;
    const inputs = {
      octograph,
      title: k,
      body: v,
      id
    }
    this.call_fifo.push(async () => {
      await addItem(inputs);
    });
  }

  awaitItem([k, resolve]: ToResolve) {
    console.log(`Awaiting ${k}`);
    if (this.waitMap.has(k)) {
      throw new Error(`Repeated ${k} handler`);
    }
    this.waitMap.set(k, resolve);
  }

  clearItems(items: Item[], clearArgs?: ClearArgs): VoidP {
    const { octograph, id } = this;
    const done = clearArgs?.done || false;
    const cmds = clearArgs?.commands || [];
    const cleared = items.filter(({ title }) => {
      const ok = cmds.some(({ text }) => text === title);
      return (cmds.length === 0) ? true : ok;
    })
    const fns = cleared.map(({id: itemId}) => {
      const inputs = { octograph, id, itemId };
      const ignore = () => null;
      return async () => {
        await removeItem(inputs).catch(ignore);
      };
    });
    return new Promise(resolve => {
      this.call_fifo.push(async () => {
        await Promise.all(fns);
        this.done = done;
        resolve();
      });
    });
  }

  async clear(clearArgs?: ClearArgs): VoidP {
    return await this.clearItems(this.items, clearArgs);
  }

  finish() {
    return this.clear({done: true});
  }
}

export {
  Project
}
