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
    /** The custom domain routed to the application, if any. */
    assignedCustomDomain?: string | null;
    /** A custom domain waiting for its ownership proof: publish the TXT record below, then call `verifyCustomDomain`. */
    customDomainPending?: string;
    /** Name of the TXT record that proves you own `customDomainPending`. */
    customDomainTxtName?: string;
    /** Value of that TXT record. */
    customDomainTxtValue?: string;
    /** The main file, relative to the application root. */
    mainFile?: string;
    startupCommand: string;
    /** Runs after the dependencies are installed and before `startupCommand`, if any. */
    buildCommand?: string | null;
    installDependenciesCmd: string | null;
    runtimeEnvironment: string;
    autoRestartEnabled: boolean;
    status: "active" | "creating" | "suspended";
    createdAt: string;
    updatedAt: string;
}
