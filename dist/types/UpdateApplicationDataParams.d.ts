export interface UpdateApplicationDataParams {
    appId: string;
    appName: string;
    memoryMB: number;
    startupCommand?: string;
    /** Runs after the dependencies are installed and before the start command. An empty string removes it. */
    buildCommand?: string;
    /** The main file, relative to the application root. A default start command follows it; one you wrote stays. */
    mainFile?: string;
    /**
     * A custom domain (the application must be exposed via web and the domain must use Cloudflare). It is not routed
     * until you publish the TXT record the application returns and call `verifyCustomDomain`. An empty string removes it.
     */
    assignedCustomDomain?: string;
    runtimeEnvironment: "nodejs" | "bun" | "python";
    exposedViaWeb?: boolean;
    autoRestartEnabled?: boolean;
    teamId?: string;
    environmentVariables?: {
        key: string;
        value: string;
    }[];
}
