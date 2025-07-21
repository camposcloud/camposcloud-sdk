export interface ApplicationResponseData {
    _id: string;
    containerId: string;
    teamId: string | null;
    restartRequired: boolean;
    userId: string;
    name: string;
    allocatedMemoryMB: number;
    allocatedVCpu: number;
    workerNodeId: {
        _id: string;
        nodeName: string;
    };
    currentResourceMetrics: {
        timestamp?: string;
        online: boolean;
        uptime?: number;
        cpuUsagePercent?: number;
        memoryUsageBytes?: number;
        memoryLimitBytes?: number;
        networkRxBytes?: number;
        networkTxBytes?: number;
    };
    containerImage: string;
    exposedViaWeb: boolean;
    internalPort: number | null;
    externalPort: number | null;
    assignedSubdomain: string | null;
    startupCommand: string;
    installDependenciesCmd: string | null;
    runtimeEnvironment: string;
    autoRestartEnabled: boolean;
    status: "active" | "creating" | "suspended"
    createdAt: string;
    updatedAt: string;
}