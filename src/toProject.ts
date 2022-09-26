import { graphql } from "@octokit/graphql";
import { needKeys } from "./util/keys";
import { Project } from "./project";

import type { Command } from "./toNamespace";

type HasId = Record<"id", number>;

type OwnerInputs = {
  owner: string,
  octograph: any
}
interface SeeOwner {
  (i: OwnerInputs): Promise<HasId>;
}
type LoadInputs = OwnerInputs & {
  ownerId: number,
  title: string
}
type Loaded = HasId & {
  number: number
}
interface LoadProject {
  (i: LoadInputs): Promise<Loaded>;
}
export interface ToProjectInputs {
  commands?: Command[];
  delay?: number;
  limit?: number;
  token: string;
  owner: string;
  title: string;
}

const findProject: LoadProject = async (inputs) => {
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
}

const createProject: LoadProject = async (inputs) => {
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
}

const loadProject: LoadProject = async (inputs) => {
  const { title } = inputs;
  const node = await findProject(inputs);
  const need_keys = ["number", "id"];
  try {
    needKeys(node || {}, need_keys);
    console.log(`Found Project '${title}'`);
    return node;
  }
  catch {
    console.log(`Creating Project '${title}'`);
    return await createProject(inputs);
  }
}

const seeOwner: SeeOwner = async (inputs) => {
  const { octograph, owner } = inputs;
  return (await octograph(`
    query {
      user(login: "${owner}") {
        id
      }
    }
  `)).user;
}

const toProject = (inputs: ToProjectInputs) => {
  const {token, owner, title} = inputs;
  const { commands, limit, delay } = inputs;
  const octograph = graphql.defaults({
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
        limit,
        delay,
        commands,
        number,
        id
      };
      return new Project(inputs_3);
    }).catch((e: any) => {
      console.error(`Unable to load project.`);
      console.error(e?.message);
    })
  }).catch((e: any) => {
    console.error(`Unable to see owner "${owner}"`);
    console.error(e?.message);
  });
}

export {
  toProject
}
