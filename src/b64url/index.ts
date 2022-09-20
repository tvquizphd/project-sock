const chars = [
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'abcdefghijklmnopqrstuvwxyz',
  '0123456789-_'
].join('');

const lookup = ((str: string) => {
  const out = new Uint8Array(256);
  for (let i = 0; i < str.length; i++) {
    out[str.charCodeAt(i)] = i;
  }
  return out;
})(chars);

const toB64url = (bytes: Uint8Array): string => {
  const len = bytes.length;
  let str = '';

  for (let i = 0; i < len; i += 3) {
    str += chars[bytes[i] >> 2];
    str += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    str += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    str += chars[bytes[i + 2] & 63];
  }
  if (len % 3 === 2) {
    str = str.substring(0, str.length - 1) + '=';
  } else if (len % 3 === 1) {
    str = str.substring(0, str.length - 2) + '==';
  }
  return str;
}

const fromB64url = (str: string): Uint8Array => {
  const len = str.length;
  let bufferLength = str.length * 0.75;

  if (str[str.length - 1] === '=') {
    bufferLength--;
    if (str[str.length - 2] === '=') {
      bufferLength--;
    }
  }
  const arraybuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arraybuffer);
  let p = 0;

  for (let i = 0; i < len; i += 4) {
    const encoded1 = lookup[str.charCodeAt(i)];
    const encoded2 = lookup[str.charCodeAt(i + 1)];
    const encoded3 = lookup[str.charCodeAt(i + 2)];
    const encoded4 = lookup[str.charCodeAt(i + 3)];
    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }
  return bytes;
}

const toB64val = v => {
  if (v.constructor === Uint8Array) {
    return ":" + toB64url(v);
  }
  if (Array.isArray(v)) {
    return v.map(i => toB64urlObj(i));
  }
  if (typeof v === "object") {
    return toB64urlObj(v);
  }
  return v;
}

const toB64urlObj = o => {
  const entries = Object.entries(o);
  return entries.reduce((out, [k, v]) => {
    return {...out, [k]: toB64val(v)};
  }, {});
}

const fromB64val = (v) => {
  if (typeof v === "string" && v[0] === ":") {
    const val = v.slice(1);
    if (!val.match(/[^0-9a-zA-Z=_-]/)) {
      return fromB64url(val);
    }
  }
  if (Array.isArray(v)) {
    return v.map(i => fromB64urlObj(i));
  }
  if (typeof v === "object") {
    return fromB64urlObj(v);
  }
  if (v == "true") {
    return true;
  }
  if (v == "false") {
    return false;
  }
  return v;
}

const nester = (params) => {
  const keyLists = Object.keys(params).map(k => {
    const l = k.split('__');
    return {k, l, len: l.length};
  });
  const keys = keyLists.sort((a, b) => a.len - b.len);
  return keys.reduce((o, {k, l, len}) => {
    let node = o;
    for (let i = 0; i < len - 1; i++) {
      if (!(l[i] in node)) {
        node[l[i]] = {};
      }
      node = node[l[i]];
    }
    const last = l.slice(-1)[0];
    node[last] = params[k];
    return o;
  }, {});
}

const fromB64urlObj = (o) => {
  const entries = Object.entries(o);
  return entries.reduce((out, [k, v]) => {
    return {...out, [k]: fromB64val(v)};
  }, {});
}

const _toB64urlQuery = (o, pre=[]) => {
  const entries = Object.entries(toB64urlObj(o));
  return entries.reduce((out, [k, v]) => {
    const keys = [...pre, k];
    const key = keys.join('__');
    if (typeof v === "object") {
      const value = _toB64urlQuery(v, keys);
      return `${out}${value}`;
    }
    return `${out}&${key}=${v}`;
  }, '');
}

const toB64urlQuery = o => {
  return _toB64urlQuery(o).replace('&', '?')
}

const fromB64urlQuery = search => {
  const searchParams = new URLSearchParams(search);
  const params = Object.fromEntries(searchParams.entries());
  return fromB64urlObj(nester(params));
}

export {
  toB64urlQuery,
  fromB64urlQuery
}
