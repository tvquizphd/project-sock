import { graphql } from "@octokit/graphql";
import { strict as assert } from 'assert';
import { deploy, undeploy } from "../dist";
import * as dotenv from "dotenv";

describe("Deploy and Undeploy", () => {
  dotenv.config();
  const repo = process.env.GITHUB_REPO || "";
  const owner = process.env.GITHUB_USER || "";
  const token = process.env.GITHUB_TOKEN || "";
  const ok = "Deployed/undeployed sucessfully";
  const error = "Error depolying/undeploying";
  const accept = "application/vnd.github.flash-preview+json";
  const octograph = graphql.defaults({
    headers: {
      accept,
      authorization: `token ${token}`
    }
  });
  const inputs = { owner, repo, octograph };
  it("Test deployment", async () => {
    let passed = true;
    try {
      const { success: ok1 } = await deploy(inputs);
      const { success: ok2 } = await undeploy(inputs);
      if (!ok1 || !ok2) {
        passed = false;
      }
    }
    catch (e: any) {
      console.error(e?.message);
      passed = false;
    }
    const msg = [error, ok][+passed];
    assert(passed, msg);
  })
});
