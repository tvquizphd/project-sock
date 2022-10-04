declare type Obj = Record<string, any>;
declare type Metadata = {
    env: string;
};
declare type HasMeta = {
    metadata: Metadata;
};
export declare type DeployInputs = {
    repo: string;
    owner: string;
    octograph: any;
    metadata?: Partial<Metadata>;
};
declare type RawDeployment = {
    id: string;
    state: string;
    environment: string;
};
export declare type Deployment = RawDeployment & HasMeta;
declare type HasNodes = {
    nodes: Deployment[];
};
declare type HasStatus = {
    success: boolean;
};
declare type RepoRef = {
    refName: string;
    refId: string;
    id: string;
};
declare type RawDeployOutput = RepoRef & HasStatus;
export declare type HasDeployNodes = RepoRef & HasNodes;
export declare type DeployOutput = RawDeployOutput & HasMeta;
interface Undeploy {
    (i: DeployInputs): Promise<DeployOutput>;
}
interface Deploy {
    (i: DeployInputs): Promise<DeployOutput>;
}
interface ToDeployments {
    (i: DeployInputs): Promise<HasDeployNodes>;
}
declare const isActive: (node: Obj) => boolean;
declare const toDeployments: ToDeployments;
declare const undeploy: Undeploy;
declare const deploy: Deploy;
export { isActive, toDeployments, deploy, undeploy };
