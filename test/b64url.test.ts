import { strict as assert } from 'assert';
import { toB64urlQuery, fromB64urlQuery } from "../src/b64url"

type Assertion = [boolean, string];

describe("Base 64 conversion round trip", () => {
  const ok = "Text encoded/decoded properly";
  const error = "Error encoding/decoding text";

  const assertion_basic = ((): Assertion => {
    const expected = '?data__ev=:ACID';
    const decoded = fromB64urlQuery(expected);
    const encoded = toB64urlQuery(decoded);
    const passed = expected === encoded;
    const msg = [error, ok][+passed];
    return [ passed, msg ];
  })();
  it("Basic conversion roundtrip", () => {
    assert(...assertion_basic)
  })

  const assertion_nested = ((): Assertion => {
    const expected = '?a__a__array=:ACID&a__t__text=ACID';
    const decoded = fromB64urlQuery(expected);
    const encoded = toB64urlQuery(decoded);
    const passed = expected === encoded;
    const msg = [error, ok][+passed];
    return [ passed, msg ];
  })();
  it("Nested conversion roundtrip", () => {
    assert(...assertion_nested)
  })
})
