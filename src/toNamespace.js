"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toNamespace = void 0;
const toT = (args) => {
    return args.map(obj => {
        if (typeof obj == "string") {
            return { key: obj, list: [] };
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
        return { key, list };
    });
};
const compare = (o1, o2) => {
    const keys = Object.keys(o1);
    return keys.every(k => o1[k] === o2[k]);
};
const unique = (ops, key) => {
    return ops.reduce((list, op) => {
        const exists = list.some((val) => {
            return compare(op[key], val);
        });
        return exists ? list : [...list, op[key]];
    }, []);
};
const unpack = (v) => {
    const n0 = v.project.prefix;
    const { sep, operations } = v;
    return toT(operations).reduce((l1, o1) => {
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
                    prefix: parts.slice(0, 3).join(''),
                    suffix: parts.slice(3).join(''),
                    subcommand: n3,
                    command: n2
                };
                const socket = {
                    text: parts.slice(0, 3).join(''),
                    prefix: n0,
                    suffix: n1
                };
                const details = {
                    command, socket
                };
                return [...l3, details];
            }, l2);
        }, l1);
    }, []);
};
const toNamespace = (names) => {
    return Object.entries(names).reduce((o, [k, v]) => {
        const { project } = v;
        const ops = unpack(v);
        const sockets = unique(ops, "socket");
        const commands = unique(ops, "command");
        const namespace = { commands, sockets, project };
        return { ...o, [k]: namespace };
    }, {});
};
exports.toNamespace = toNamespace;
