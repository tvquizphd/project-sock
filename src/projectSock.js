"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toProjectSock = void 0;
const projectChannel_1 = require("./projectChannel");
const toProject_1 = require("./toProject");
const socket = (sock) => ({
    sock,
    get: (op_id, tag) => {
        return new Promise(function (resolve) {
            const k = sock.toKey(op_id, tag);
            if (!sock.hasResponse(k)) {
                sock.listenForKey(k, resolve);
            }
            else {
                sock.receiveMailKey(k, resolve);
            }
        });
    },
    give: (op_id, tag, msg) => {
        const k = sock.toKey(op_id, tag);
        sock.sendMail(k, msg);
    },
});
const toProjectSock = async (inputs) => {
    const { scope } = inputs;
    const project = await (0, toProject_1.toProject)(inputs);
    if (!project) {
        throw new Error("Unable to find project");
    }
    const inputs_1 = { scope, project };
    return socket(new projectChannel_1.ProjectChannel(inputs_1));
};
exports.toProjectSock = toProjectSock;
