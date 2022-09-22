"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.needKeys = void 0;
const needKeys = (obj, keys) => {
    const obj_keys = Object.keys(obj).join(' ');
    for (const key of keys) {
        if ('error' in obj) {
            throw new Error(obj.error);
        }
        if (!(key in obj)) {
            throw new Error(`${key} not in [${obj_keys}]`);
        }
    }
};
exports.needKeys = needKeys;
