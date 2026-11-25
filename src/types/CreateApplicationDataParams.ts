export interface CreateApplicationDataParams {
    file: Buffer;
    appName: string;
    mainFile: string;
    memoryMB: number;
    runtimeEnvironment: "nodejs" | "bun" | "python";
    exposedViaWeb?: boolean;
    autoRestartEnabled?: boolean;
    startupCommand?: string;
    /** Runs after the dependencies are installed and before the start command (for example `npm run build`). */
    buildCommand?: string;
    teamId?: string;
    environmentVariables?: { key: string; value: string }[];
}