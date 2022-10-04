import { Project } from "./project";
import type { Command } from "./toNamespace";
declare type OwnerInputs = {
    repo?: string;
    owner: string;
    octograph: any;
};
declare type HasRepoId = {
    repoId: string | null;
};
declare type HasOwnerId = {
    ownerId: string;
};
declare type FindInputs = OwnerInputs & HasRepoId & {
    title: string;
};
interface SeeOwnerIds {
    (i: OwnerInputs): Promise<HasOwnerId & HasRepoId>;
}
declare type Loaded = {
    id: string;
    number: number;
    shortDescription: string;
};
interface FindProject {
    (i: FindInputs): Promise<Loaded | null>;
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
declare const findProject: FindProject;
declare const seeOwnerIds: SeeOwnerIds;
declare const toProject: (inputs: ToProjectInputs) => Promise<void | Project>;
export { toProject, seeOwnerIds, findProject };
