"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
const addItem = async (inputs) => {
    const { octograph, title, body, id } = inputs;
    const input = "{" + [
        `projectId: "${id}"`,
        `title: "${title}"`,
        `body: "${body}"`,
    ].join(' ') + "}";
    const n = (await octograph(`
    mutation {
      addProjectV2DraftIssue(input: ${input}) {
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
  `));
    return {
        ...n.content,
        id: n.id
    };
};
const removeItem = async (inputs) => {
    const { octograph, itemId, id } = inputs;
    const input = "{" + [
        `projectId: "${id}"`,
        `itemId: "${itemId}"`,
    ].join(' ') + "}";
    const n = (await octograph(`
  mutation {
    deleteProjectV2Item( input: ${input} ) {
      deletedItemId
    }
  }`));
    return {
        id: n.deletedItemId
    };
};
const fetchItems = async (inputs) => {
    const { octograph, owner, number } = inputs;
    const { nodes } = (await octograph(`
    query {
      user(login: "${owner}"){
        projectV2(number: ${number}) {
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
  `)).user.projectV2.items;
    return nodes.map(n => {
        return {
            ...n.content,
            id: n.id
        };
    });
};
const seekItems = (inputs) => {
    const { interval } = inputs;
    const dt = 1000 * interval;
    return new Promise((resolve) => {
        setTimeout(async () => {
            const result = await fetchItems(inputs);
            resolve(result);
        }, dt);
    });
};
class Project {
    constructor(inputs) {
        const { id, number, owner, octograph, title } = inputs;
        this.commands = inputs.commands || [];
        this.id = id;
        this.title = title;
        this.owner = owner;
        this.number = number;
        this.octograph = octograph;
        this.waitMap = new Map();
        this.max_time = 15 * 60;
        this.call_fifo = [];
        this.done = false;
        this.items = [];
        this.mainLoop();
    }
    get busy() {
        return !!this.call_fifo.length;
    }
    get itemObject() {
        return this.items.reduce((o, i) => {
            return { ...o, [i.title]: i };
        }, {});
    }
    get commandObject() {
        return this.commands.reduce((o, c) => {
            return { ...o, [c.text]: c };
        }, {});
    }
    get hasCommands() {
        return this.commands.length > 0;
    }
    hasResponse(k) {
        return k in this.itemObject;
    }
    async mainLoop() {
        const inputs = {
            interval: 1.0,
            owner: this.owner,
            number: this.number,
            octograph: this.octograph
        };
        while (!this.done) {
            // Add or remove
            if (this.busy) {
                try {
                    await this.call_fifo.shift()();
                }
                catch (e) {
                    continue;
                }
            }
            // Receive
            else {
                const items = await seekItems(inputs);
                this.setItems({ items });
            }
        }
    }
    setItems({ items }) {
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
    resolver([k, resolve]) {
        const itemObject = this.itemObject;
        if (k in itemObject) {
            console.log(`Resolving ${k}`);
            if (this.waitMap.has(k)) {
                this.waitMap.delete(k);
            }
            resolve(itemObject[k].body);
            this.removeItem(k); //TODO
        }
    }
    addItem(k, v) {
        const { octograph, id } = this;
        const inputs = {
            octograph,
            title: k,
            body: v,
            id
        };
        const fn = addItem.bind(null, inputs);
        this.call_fifo.push(fn);
    }
    removeItem(k) {
        const { itemObject, octograph, id } = this;
        if (!(k in itemObject)) {
            throw new Error(`Cannot remove ${k}.`);
        }
        const item = itemObject[k];
        const inputs = {
            itemId: item.id,
            octograph,
            id
        };
        const fn = removeItem.bind(null, inputs);
        this.call_fifo.push(fn);
    }
    awaitItem([k, resolve]) {
        console.log(`Awaiting ${k}`);
        if (this.waitMap.has(k)) {
            throw new Error(`Repeated ${k} handler`);
        }
        this.waitMap.set(k, resolve);
    }
    async clear(clearArgs) {
        const done = clearArgs.done || false;
        const cmds = clearArgs.commands || [];
        const { octograph, id, owner, number } = this;
        const to_fetch = { id, owner, number, octograph };
        const items = await fetchItems(to_fetch);
        const clearItems = items.filter(({ title }) => {
            const ok = cmds.some(({ text }) => text === title);
            return (cmds.length === 0) ? true : ok;
        });
        const fns = clearItems.map(({ id: itemId }) => {
            const inputs = { octograph, id, itemId };
            return removeItem.bind(null, inputs);
        }).concat([() => this.done = done]);
        // Add removal functions to queue
        this.call_fifo = this.call_fifo.concat(fns);
    }
    finish() {
        return this.clear({ done: true });
    }
}
exports.Project = Project;
