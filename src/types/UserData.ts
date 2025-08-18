export interface UserData {
    _id: string;
    name: string;
    email: string;
    isEmail2FAEnabled: boolean;
    hasClaimedFreePlan: boolean;
    createdAt: string;
    activeSessions: [
        {
            id: string;
            device: string;
            ip: string;
            browser: string;
            os: string;
            lastActive: string;
        }
    ],
    currentSubscription?: {
        planReference: {
            _id: string;
            name: string;
            type: string;
            enabled: string;
            description: string;
            color: string;
            createdAt: string;
            updatedAt: string;
            ramMB?: number;
        }
        negotiatedPrice?: number;
        allocatedMemoryMB?: number;
        allocatedVCpus?: number;
        amountPaid: number;
        status: "active" | "suspended",
        startAt: string;
        endAt: string;
    }
}