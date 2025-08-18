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
        permissions: {
            canCreateApplication: boolean;
            canDeleteApplication: boolean;
            canUpdateApplicationSettings: boolean;
            canChangeStatusApplication: boolean;
            canEditApplicationFiles: boolean;
            canSeeApplicationFiles: boolean;
            canDeleteApplicationFiles: boolean;
        };
    }[];
    invites: {
        email: string;
        permissions: {
            canCreateApplication: boolean;
            canDeleteApplication: boolean;
            canUpdateApplicationSettings: boolean;
            canChangeStatusApplication: boolean;
            canEditApplicationFiles: boolean;
            canSeeApplicationFiles: boolean;
            canDeleteApplicationFiles: boolean;
        };
    }[];
    createdAt: string;
    updatedAt: string;
    applicationsCount: number;
}
