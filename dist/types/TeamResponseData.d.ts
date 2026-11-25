/** What a team member may do. The team owner always has every permission. */
export interface TeamPermissions {
    canCreateApplication: boolean;
    canDeleteApplication: boolean;
    canUpdateApplicationSettings: boolean;
    canChangeStatusApplication: boolean;
    canManageApplicationBackup: boolean;
    canEditApplicationFiles: boolean;
    canSeeApplicationFiles: boolean;
    canDeleteApplicationFiles: boolean;
    canCreateDatabase: boolean;
    canDeleteDatabase: boolean;
    canUpdateDatabaseSettings: boolean;
    canChangeStatusDatabase: boolean;
    /** Read the console (logs) of the team's applications. */
    canSeeApplicationLogs: boolean;
    /** See the environment variables of the team's applications. */
    canSeeApplicationEnv: boolean;
    /** Change the environment variables of the team's applications. */
    canEditApplicationEnv: boolean;
    /** Change the subdomain and the custom domain of the team's applications. */
    canManageApplicationDomains: boolean;
    /** Deploy the team's applications (GitHub deploys). */
    canDeployApplication: boolean;
    /** See the credentials of the team's databases. */
    canSeeDatabaseCredentials: boolean;
    /** Invite and remove members and change their permissions, like the owner. */
    canManageMembers: boolean;
}
/** Every permission key, in the order the panel shows them. */
export declare const TEAM_PERMISSION_KEYS: (keyof TeamPermissions)[];
/** A named set of permissions of a team (Administrador, Desenvolvedor, ...). */
export interface TeamRole {
    _id: string;
    name: string;
    permissions: TeamPermissions;
}
export interface TeamResponseData {
    _id: string;
    name: string;
    owner: {
        _id: string;
        name: string;
        email: string;
    };
    members: {
        user: {
            _id: string;
            name: string;
            email: string;
        };
        permissions: TeamPermissions;
        /** The role the member follows, if any. */
        roleId?: string | null;
    }[];
    invites: {
        email: string;
        permissions: TeamPermissions;
        /** The role the person receives when accepting, if any. */
        roleId?: string | null;
    }[];
    /** The roles of the team. */
    roles?: TeamRole[];
    createdAt: string;
    updatedAt: string;
    applicationsCount: number;
}
