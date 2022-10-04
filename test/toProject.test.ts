import { graphql } from "@octokit/graphql";
import { strict as assert } from 'assert';
import { findProject } from "../src/";
import { toProject } from "../src/";
import * as crypto from "crypto";
import * as dotenv from "dotenv";

import type { ToProjectInputs } from "../src";

interface CloseProject {
  (i: ToProjectInputs): Promise<void>
}

const closeProject: CloseProject = async (inputs) => {
  await new Promise(r => setTimeout(r, 500));
  const { title, owner, token } = inputs;
  const octograph = graphql.defaults({
    headers: {
      authorization: `token ${token}`
    }
  });
  const repoId = null;
  const find_input = { repoId, title, owner, octograph };
  const node = await findProject(find_input);
  if (!node) {
    console.error("No project to close!")
    return;
  }
  await octograph(`
    mutation($id: ID!) {
      updateProjectV2( input: { projectId: $id, closed: true} ) {
        projectV2 {
          id
        }
      }
    }
  `, node);
}

describe("Create projects", () => {
  dotenv.config();
  const repo = process.env.GITHUB_REPO || "";
  const owner = process.env.GITHUB_USER || "";
  const token = process.env.GITHUB_TOKEN || "";
  const ok = "Created project sucessfully";
  const error = "Error creating project";
  const core_inputs = { owner, token };
  it("Create User Project", async () => {
    let passed = true;
    const inputs: ToProjectInputs = { 
      ...core_inputs,
      title: crypto.randomUUID()
    };
    let proj;
    try {
      proj = await toProject(inputs);
      await proj?.finish();
    }
    catch (e: any) {
      console.error(e?.message);
      passed = false;
    }
    finally {
      await closeProject(inputs);
    }
    const msg = [error, ok][+passed];
    assert(passed, msg);
  })
  it("Create Repo Project", async () => {
    let passed = true;
    const inputs: ToProjectInputs = { 
      repo,
      ...core_inputs,
      title: crypto.randomUUID()
    };
    let proj;
    try {
      proj = await toProject(inputs);
      await proj?.finish();
    }
    catch (e: any) {
      console.error(e?.message);
      passed = false;
    }
    finally {
      await closeProject(inputs);
    }
    const msg = [error, ok][+passed];
    assert(passed, msg);
  })
});
