import { graphql } from "@octokit/graphql";
import { needKeys } from "./util/keys.js";
import { Project } from "./project.js";

import type { Command } from "./toNamespace.js";

type OwnerInputs = {
  repo?: string,
  owner: string,
  octograph: any
}
type HasRepoId = {
  repoId: string | null,
}
type HasOwnerId = {
  ownerId: string
}
type FindInputs = OwnerInputs & HasRepoId & {
  title: string
}
interface SeeOwnerIds {
  (i: OwnerInputs): Promise<HasOwnerId & HasRepoId>;
}
type LoadInputs = FindInputs & HasOwnerId; 
type Loaded = {
  id: string,
  number: number,
  shortDescription: string
}
interface FindProject {
  (i: FindInputs): Promise<Loaded | null>;
}
interface LoadProject {
  (i: LoadInputs): Promise<Loaded>;
}
export interface ToProjectInputs {
  commands?: Command[];
  delay?: number;
  limit?: number;
  repo?: string;
  token: string;
  owner: string;
  title: string;
}

function isLoaded (x: unknown): x is Loaded {
  const details = "shortDescription"; 
  const need_keys = [details, "number", "id"];
  try {
    needKeys(x || {}, need_keys);
    return true; 
  }
  catch {
    return false; 
  }
}

const findProject: FindProject = async (inputs) => {
  const { octograph } = inputs;
  const { projectsV2 } = (await octograph(`
    query($title: String!, $owner: String!) {
      user(login: $owner) {
        projectsV2(first: 100, query: $title) {
          nodes {
            shortDescription,
            number,
            id
          }
        }
      }
    }
  `, inputs)).user;
  const { repoId } = inputs;
  const nodes = projectsV2.nodes.filter((node: Loaded) => {
    const details = node.shortDescription;
    return !repoId || repoId === details;
  });
  if (nodes.length) {
    return nodes[0];
  }
  return null;
}

const createProject: LoadProject = async (inputs) => {
  const { octograph, ownerId, title } = inputs;
  const create_in = {o: ownerId, t: title};
  const { projectV2 } = (await octograph(`
    mutation($o: ID!, $t: String!) {
      createProjectV2(input: {ownerId: $o, title: $t}) {
        projectV2 {
          shortDescription,
          number,
          id
        }
      }
    }
  `, create_in)).createProjectV2;
  if (!inputs.repoId) {
    return projectV2;
  }
  const update_in = {p: projectV2.id, r: inputs.repoId};
  const { updateProjectV2 } = await octograph(`
    mutation($p: ID!, $r: String!) {
      updateProjectV2(input: {projectId: $p, shortDescription: $r}) {
        projectV2 {
          shortDescription,
          number,
          id
        }
      }
    }
  `, update_in);
  return updateProjectV2.projectV2;
}

const loadProject: LoadProject = async (inputs) => {
  const { title } = inputs;
  const node = await findProject(inputs);
  if (isLoaded(node)) {
    console.log(`Found Project '${title}'`);
    return node;
  }
  console.log(`Creating Project '${title}'`);
  return await createProject(inputs);
}

const seeOwnerIds: SeeOwnerIds = async (inputs) => {
  const { octograph } = inputs;
  const isRepo = !!inputs.repo;
  if (isRepo) {
    const { user } = (await octograph(`
      query($repo: String!, $owner: String!) {
        user(login: $owner) {
          repository(name: $repo) {
            id
          },
          id
        }
      }
    `, inputs));
    const ownerId = user.id;
    const repoId = user.repository.id;
    return  { ownerId, repoId };
  }
  const ownerId = (await octograph(`
    query($owner: String!) {
      user(login: $owner) {
        id
      }
    }
  `, inputs)).user.id;
  const repoId = null;
  return  { repoId, ownerId };
}

const toProject = (inputs: ToProjectInputs) => {
  const { token, owner, title, repo } = inputs;
  const { commands, limit, delay } = inputs;
  const octograph = graphql.defaults({
    headers: {
      authorization: `token ${token}`,
    }
  });
  const inputs_1 = { owner, repo, octograph };
  const promise_ids = seeOwnerIds(inputs_1);
  return promise_ids.then(({ repoId, ownerId }) => {
    const inputs_2 = {
       owner, repo, repoId, ownerId, octograph, title
    };
    const promise_project = loadProject(inputs_2);
    return promise_project.then(({ id, number }) => {
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
    });
  }).catch((e: any) => {
    console.error(`Unable to see owner "${owner}"`);
    console.error(e?.message);
  });
}

export {
  toProject,
  seeOwnerIds,
  findProject
}
