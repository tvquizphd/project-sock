"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toProject = void 0;
const graphql_1 = require("@octokit/graphql");
const keys_1 = require("./util/keys");
const project_1 = require("./project");
const findProject = async (inputs) => {
    const { octograph, owner, title } = inputs;
    const { nodes } = (await octograph(`
    query {
      user(login: "${owner}"){
        projectsV2(first: 1, query: "${title}") {
          nodes {
            number,
            id
          }
        }
      }
    }
  `)).user.projectsV2;
    return nodes.length ? nodes[0] : null;
};
const createProject = async (inputs) => {
    const { octograph, ownerId, title } = inputs;
    const input = `{ownerId: "${ownerId}", title: "${title}"}`;
    return (await octograph(`
    mutation {
      createProjectV2(input: ${input}) {
        projectV2 {
          number,
          id
        }
      }
    }
  `)).createProjectV2.projectV2;
};
const loadProject = async (inputs) => {
    const { title } = inputs;
    const node = await findProject(inputs);
    const need_keys = ["number", "id"];
    try {
        (0, keys_1.needKeys)(node || {}, need_keys);
        console.log(`Found Project '${title}'`);
        return node;
    }
    catch {
        console.log(`Creating Project '${title}'`);
        return await createProject(inputs);
    }
};
const seeOwner = async (inputs) => {
    const { octograph, owner } = inputs;
    return (await octograph(`
    query {
      user(login: "${owner}") {
        id
      }
    }
  `)).user;
};
const toProject = (inputs) => {
    const { token, owner, title } = inputs;
    const octograph = graphql_1.graphql.defaults({
        headers: {
            authorization: `token ${token}`,
        }
    });
    const inputs_1 = { owner, octograph };
    const promise_1 = seeOwner(inputs_1);
    return promise_1.then((user) => {
        const ownerId = user.id;
        const inputs_2 = {
            owner, ownerId, octograph, title
        };
        const promise_2 = loadProject(inputs_2);
        return promise_2.then(({ id, number }) => {
            console.log(`Loaded Project '${title}'`);
            const inputs_3 = {
                ...inputs_2,
                number,
                id
            };
            return new project_1.Project(inputs_3);
        }).catch((error) => {
            console.error(`Unable to load project.`);
            console.error(error.message);
        });
    }).catch((error) => {
        console.error(`Unable to see owner "${owner}"`);
        console.error(error.message);
    });
};
exports.toProject = toProject;
