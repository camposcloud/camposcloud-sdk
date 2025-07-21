export interface CreateApplicationDataParams {
    file: Buffer;
    appName: string;
    mainFile: string;
    memoryMB: number;
    runtimeEnvironment: "nodejs" | "python";
    exposedViaWeb?: boolean;
    autoRestartEnabled?: boolean;
    startupCommand?: string;
    teamId?: string;
}
