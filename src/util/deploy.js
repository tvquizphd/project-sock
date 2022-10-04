"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.undeploy = exports.deploy = exports.toDeployments = exports.isActive = void 0;
const FIELDS = `
            id,
            state,
            task,
            payload,
            environment`;
const toAddMeta = (inputs) => {
    const base_env = "development";
    const base_meta = { env: base_env };
    const has_meta = (inputs.metadata || {});
    const metadata = { ...base_meta, ...has_meta };
    function plusMeta(n) {
        return { ...n, metadata };
    }
    return plusMeta;
};
function isDeployment(n) {
    return "state" in n && "environment" in n;
}
const isEnv = (node) => {
    const { env } = node.metadata;
    const is_env = env === node.environment;
    return isDeployment(node) && is_env;
};
const isPending = (node) => {
    const is_pending = 'PENDING' === node.state;
    return isEnv(node) && is_pending;
};
const isActive = (node) => {
    const is_active = 'IN_PROGRESS' === node.state;
    return isEnv(node) && is_active;
};
exports.isActive = isActive;
const toDeployments = async (inputs) => {
    const { octograph } = inputs;
    const plusMeta = toAddMeta(inputs);
    const { repository } = (await octograph(`
    query($repo: String!, $owner: String!) {
      repository( name: $repo, owner: $owner ) {
        id,
        defaultBranchRef {
          id,
          name
        },
        deployments( last: 100 ) {
          nodes {${FIELDS}
          }
        }
      }
    }
  `, inputs));
    const { id, defaultBranchRef, deployments } = repository;
    const nodes = deployments.nodes.map(plusMeta).filter(isEnv);
    const { name: refName } = defaultBranchRef;
    const { id: refId } = defaultBranchRef;
    return { nodes, refId, refName, id };
};
exports.toDeployments = toDeployments;
const undeploy = async (inputs) => {
    const success = false;
    const plusMeta = toAddMeta(inputs);
    const { nodes, ...has_ref } = await toDeployments(inputs);
    const output = plusMeta({ ...has_ref, success });
    const { octograph } = inputs;
    const promises = nodes.map(node => {
        return octograph(`
      mutation($id: ID!) {
        deleteDeployment( input: { id: $id } ) {
          clientMutationId
        }
      }
    `, node);
    });
    await Promise.all(promises);
    output.success = !!nodes.length;
    return output;
};
exports.undeploy = undeploy;
const toActive = async (octograph, created) => {
    const has_state = { ...created, state: 'IN_PROGRESS' };
    const start_input = [
        "deploymentId: $id",
        "state: $state"
    ].join(", ");
    const { deployment } = (await octograph(`
    mutation($id: ID!, $state: DeploymentStatusState!) {
      createDeploymentStatus( input: { ${start_input} } ) {
        deploymentStatus {
          deployment {${FIELDS}
          }
        }
      }
    }
  `, has_state)).createDeploymentStatus.deploymentStatus;
    const metadata = created.metadata;
    return { metadata, ...deployment };
};
const deploy = async (inputs) => {
    const success = false;
    const { octograph } = inputs;
    const plusMeta = toAddMeta(inputs);
    const has_ref = await undeploy(inputs);
    const output = plusMeta({ ...has_ref, success });
    const { metadata } = output;
    const create_input = [
        "environment: $env",
        "repositoryId: $id",
        "refId: $refId"
    ].join(", ");
    const has_env = { ...has_ref, ...metadata };
    const created = plusMeta((await octograph(`
    mutation($env: String!, $id: ID!, $refId: ID!) {
      createDeployment( input: { ${create_input} } ) {
        deployment {${FIELDS}
        }
      }
    }
  `, has_env)).createDeployment.deployment);
    if (!isDeployment(created)) {
        return output;
    }
    if (!isPending(created)) {
        return output;
    }
    const activated = await toActive(octograph, created);
    if (!isActive(activated)) {
        return output;
    }
    output.success = true;
    return output;
};
exports.deploy = deploy;
