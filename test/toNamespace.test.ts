import { strict as assert } from 'assert';
import { toNamespace } from "../src/"

const projects = [{
  title: "verify",
  prefix: "v"
}]

const namespaces = [{
  "opaque":{
    "commands":[
      {"text":"v__v:pake_init__sid","prefix":"v__v","suffix":":pake_init__sid","subcommand":"sid","command":":pake_init"},
      {"text":"v__v:pake_init__pw","prefix":"v__v","suffix":":pake_init__pw","subcommand":"pw","command":":pake_init"},
      {"text":"v__v:pake_init__registered","prefix":"v__v","suffix":":pake_init__registered","subcommand":"registered","command":":pake_init"},
      {"text":"v__v:pake__alpha","prefix":"v__v","suffix":":pake__alpha","subcommand":"alpha","command":":pake"},
      {"text":"v__v:pake__Xu","prefix":"v__v","suffix":":pake__Xu","subcommand":"Xu","command":":pake"},
      {"text":"v__v:pake__Au","prefix":"v__v","suffix":":pake__Au","subcommand":"Au","command":":pake"},
      {"text":"v__v:pake__client_authenticated","prefix":"v__v","suffix":":pake__client_authenticated","subcommand":"client_authenticated","command":":pake"},
      {"text":"v__v:pake__beta","prefix":"v__v","suffix":":pake__beta","subcommand":"beta","command":":pake"},
      {"text":"v__v:pake__Xs","prefix":"v__v","suffix":":pake__Xs","subcommand":"Xs","command":":pake"},
      {"text":"v__v:pake__c","prefix":"v__v","suffix":":pake__c","subcommand":"c","command":":pake"},
      {"text":"v__v:pake__As","prefix":"v__v","suffix":":pake__As","subcommand":"As","command":":pake"},
      {"text":"v__v:pake__authenticated","prefix":"v__v","suffix":":pake__authenticated","subcommand":"authenticated","command":":pake"}
    ],
    "sockets":[
      {"text":"v__v","prefix":"v","suffix":"v"}
    ],
    "project":{"title":"verify","prefix":"v"}
  },
  "control":{
    "commands":[
      {"text":"v__stat:next__reset","prefix":"v__stat","suffix":":next__reset","subcommand":"reset","command":":next"},
      {"text":"v__stat:next__start","prefix":"v__stat","suffix":":next__start","subcommand":"start","command":":next"}
    ],
    "sockets":[
      {"text":"v__stat","prefix":"v","suffix":"stat"}
    ],
    "project":{"title":"verify","prefix":"v"}
  }
}];

describe("Create namespace #1", () => {
  const namespace = toNamespace({
    opaque: {
      sep: "__",
      project: projects[0],
      operations: [{
        "v": [{
          ":pake_init": [
            "sid", "pw", "registered"
          ],
        }, {
          ":pake": [
            "alpha", "Xu", "Au", "client_authenticated",
            "beta", "Xs", "c", "As", "authenticated"
          ]
        }]
      }]
    },
    control: {
      sep: "__",
      project: projects[0],
      operations: [{
        "stat": [{
          ":next": ["reset", "start"]
        }]
      }]
    }
  })
  const ok = "Namespace parsed properly";
  const error = "Namespace not parsed properly";
  const str_ok = JSON.stringify(namespaces[0]);
  const str_test = JSON.stringify(namespace);
  const passed = str_ok === str_test;
  const msg = [error, ok][+passed];
  it("matches namespace #1", () => {
    assert(passed, msg)
  })
})
