export interface UpdateApplicationDataParams {
    appId: string;
    appName: string;
    memoryMB: number;
    startupCommand: string;
    runtimeEnvironment: "nodejs" | "python";
    exposedViaWeb?: boolean;
    autoRestartEnabled?: boolean;
    teamId?: string;
    environmentVariables?: { key: string; value: string }[];
}