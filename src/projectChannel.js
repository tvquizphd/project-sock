"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectChannel = void 0;
const b64url_1 = require("./b64url");
const serialize = (data) => {
    return (0, b64url_1.toB64urlQuery)({ data });
};
const deserialize = (str) => {
    return (0, b64url_1.fromB64urlQuery)(str).data;
};
class ProjectChannel {
    constructor(inputs) {
        const { project, scope } = inputs;
        this.project = project;
        this.scope = scope;
    }
    hasResponse(k) {
        return this.project.hasResponse(k);
    }
    toKey(op_id, tag) {
        const names = [this.scope, op_id, tag];
        return names.join('__');
    }
    listenForKey(k, res) {
        const resolve = (s) => res(deserialize(s));
        this.project.awaitItem([k, resolve]);
    }
    receiveMailKey(k, res) {
        const resolve = (s) => res(deserialize(s));
        this.project.resolver([k, resolve]);
    }
    sendMail(k, a) {
        this.project.addItem(k, serialize(a));
    }
}
exports.ProjectChannel = ProjectChannel;
