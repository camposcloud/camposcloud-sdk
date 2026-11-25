import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ApplicationResponseData, CreateApplicationDataParams, UserData, TeamResponseData, UpdateApplicationDataParams } from "../types";

import FormData from "form-data";
import Application from "./Application";
import { AxiosError } from "axios";

/** The body of every error of the API: `error` always, `code` (stable, for your code) on many of them. */
export interface CamposCloudApiErrorBody {
    error: string;
    /** For example "PLAN_MEMORY_LIMIT", "APPLICATION_NOT_FOUND", "MAIN_FILE_INVALID", "CUSTOM_DOMAIN_TXT_NOT_FOUND". */
    code?: string;
    [detail: string]: unknown;
}

/**
 * What the API said about a failed call: the HTTP status, its message and, when there is one, its stable `code`.
 * Returns null for anything that is not an answer of the API (no connection, timeout, a bug in your code).
 *
 *     try { await sdk.verifyCustomDomain({ appId }) }
 *     catch (err) { if (getApiError(err)?.code === "CUSTOM_DOMAIN_TXT_NOT_FOUND") { ...wait and retry } }
 */
export function getApiError(error: unknown): { status: number; error: string; code?: string; body: CamposCloudApiErrorBody } | null {
    const response = (error as AxiosError | undefined)?.response;
    if (!response || typeof response.status !== "number") return null;
    const data = response.data as Partial<CamposCloudApiErrorBody> | undefined;
    const body: CamposCloudApiErrorBody = data && typeof data === "object" && typeof data.error === "string"
        ? (data as CamposCloudApiErrorBody)
        : { error: `HTTP ${response.status}` };
    return { status: response.status, error: body.error, ...(typeof body.code === "string" ? { code: body.code } : {}), body };
}

export default class CamposCloudSDK {

    private apiToken: string;
    private axiosInstance: AxiosInstance;

    /**
     * @param apiToken  your API key (a `cc_pat_...` token from the panel)
     * @param baseUrl   only to point the SDK at another server (for example a local control); defaults to production
     */
    constructor({ apiToken, baseUrl }: { apiToken: string, baseUrl?: string }) {
        if (!apiToken) {
            throw new Error("API Token is required to initialize CamposCloudSDK.");
        }

        this.apiToken = apiToken;
        this.axiosInstance = axios.create({
            baseURL: baseUrl ? `${baseUrl.replace(/\/+$/, "")}/v1/` : "https://api.camposcloud.com/v1/",
            headers: {
                Authorization: `Bearer ${this.apiToken}`,
                "Content-Type": "application/json"
            }
        });
    }

    public getApplication = async ({ appId }: { appId: string }): Promise<Application> => {
        if (!appId || typeof appId !== "string") {
            throw new Error("Application ID (appId) must be a valid string.");
        }

        const response = await this.axiosInstance.get(`/apps/${appId}`);
        return new Application(this, response.data as ApplicationResponseData);
    }

    public getApplications = async () => {
        const response = await this.axiosInstance.get("/apps");

        return response.data as { 
            applications: ApplicationResponseData[], 
            totalUsedRAM: string, 
            pagination: { 
                totalItems: number, 
                totalPages: number,
                currentPage: number,
                itemsPerPage: number
                hasNextPage: boolean,
                hasPrevPage: boolean
            }
        };
    }

    public createApplication = async (data: CreateApplicationDataParams): Promise<Application> => {
        const { file, appName, mainFile, memoryMB, runtimeEnvironment, exposedViaWeb, autoRestartEnabled, startupCommand, buildCommand, teamId, environmentVariables } = data;

        if (!file){
            throw new Error("File is required to create an application.");
        }

        if (!appName){
            throw new Error("Application name (appName) is required.");
        }

        if (!mainFile){
            throw new Error("Main file (mainFile) is required.");
        }

        if (!memoryMB || isNaN(Number(memoryMB))) {
            throw new Error("Memory size (memoryMB) must be a valid number.");
        }

        if (!runtimeEnvironment){
            throw new Error("Runtime environment (runtimeEnvironment) is required.");
        }

        if (environmentVariables) {
            environmentVariables.forEach(envVar => {
                if (typeof envVar.key !== "string" || typeof envVar.value !== "string") {
                    throw new Error("Environment variable keys and values must be strings.");
                }
            });
        }
 
        const formData = new FormData();
        formData.append("file", file, "file.zip");
        formData.append("appName", appName);
        formData.append("mainFile", mainFile);
        formData.append("memoryMB", memoryMB);
        formData.append("runtimeEnvironment", runtimeEnvironment);

        if (environmentVariables) {
            formData.append("environmentVariables", JSON.stringify(environmentVariables));
        }

        if (exposedViaWeb !== undefined) {
            formData.append("exposedViaWeb", String(exposedViaWeb));
        }

        if (autoRestartEnabled !== undefined) {
            formData.append("autoRestartEnabled", String(autoRestartEnabled));
        }

        if (startupCommand) {
            formData.append("startupCommand", startupCommand);
        }

        if (buildCommand) {
            formData.append("buildCommand", buildCommand);
        }

        if (teamId) {
            formData.append("team", teamId);
        }

        const response = await this.axiosInstance.post("/apps/create", formData, {
            headers: {
                ...formData.getHeaders(),
            }
        });

        return new Application(this, response.data as ApplicationResponseData);
    }

    public updateApplication = async (data: UpdateApplicationDataParams): Promise<ApplicationResponseData> => {
        const { appId, appName, memoryMB, startupCommand, buildCommand, mainFile, assignedCustomDomain, runtimeEnvironment, exposedViaWeb, autoRestartEnabled, environmentVariables } = data;

        if (!appId || typeof appId !== "string") {
            throw new Error("Application ID (appId) must be a valid string.");
        }

        if (!appName){
            throw new Error("Application name (appName) is required.");
        }

        if (!memoryMB || isNaN(Number(memoryMB))) {
            throw new Error("Memory size (memoryMB) must be a valid number.");
        }

        if (!runtimeEnvironment){
            throw new Error("Runtime environment (runtimeEnvironment) is required.");
        }

        if (environmentVariables) {
            environmentVariables.forEach(envVar => {
                if (typeof envVar.key !== "string" || typeof envVar.value !== "string") {
                    throw new Error("Environment variable keys and values must be strings.");
                }
            });
        }

        const payload: any = {
            appName,
            memoryMB,
            runtimeEnvironment
        };

        if (environmentVariables) {
            payload.environmentVariables = environmentVariables;
        }

        if (exposedViaWeb !== undefined) {
            payload.exposedViaWeb = exposedViaWeb;
        }

        if (autoRestartEnabled !== undefined) {
            payload.autoRestartEnabled = autoRestartEnabled;
        }

        if (startupCommand) {
            payload.startupCommand = startupCommand;
        }

        // An empty string is sent on purpose: it removes the build command / the custom domain.
        if (buildCommand !== undefined) {
            if (typeof buildCommand !== "string") throw new Error("Build command (buildCommand) must be a string.");
            payload.buildCommand = buildCommand;
        }

        if (mainFile !== undefined) {
            if (typeof mainFile !== "string" || !mainFile.trim()) throw new Error("Main file (mainFile) must be a non-empty string.");
            payload.mainFile = mainFile;
        }

        if (assignedCustomDomain !== undefined) {
            if (typeof assignedCustomDomain !== "string") throw new Error("Custom domain (assignedCustomDomain) must be a string.");
            payload.assignedCustomDomain = assignedCustomDomain;
        }

        const response = await this.axiosInstance.post(`/apps/${appId}/update`, payload);
        return response.data;
    }

    /**
     * Confirms the pending custom domain of an application. First set it with `updateApplication`
     * (`assignedCustomDomain`), then publish the TXT record from `customDomainTxtName` / `customDomainTxtValue`.
     * Until the record propagates the API answers 400 with code "CUSTOM_DOMAIN_TXT_NOT_FOUND" (see `getApiError`).
     */
    public verifyCustomDomain = async ({ appId }: { appId: string }): Promise<{ verified: boolean }> => {
        if (!appId || typeof appId !== "string") {
            throw new Error("Application ID (appId) must be a valid string.");
        }

        const response = await this.axiosInstance.post(`/apps/${encodeURIComponent(appId)}/custom-domain/verify`);
        return response.data as { verified: boolean };
    }

    public deleteApplication = async ({ appId }: { appId: string }): Promise<AxiosResponse> => {
        if (!appId || typeof appId !== "string") {
            throw new Error("Application ID (appId) must be a valid string.");
        }

        const response = await this.axiosInstance.delete(`/apps/${appId}/delete`)
        return response as AxiosResponse;
    }

    public startApplication = async ({ appId }: { appId: string }): Promise<ApplicationResponseData> => {
        if (!appId || typeof appId !== "string") {
            throw new Error("Application ID (appId) must be a valid string.");
        }

        const response = await this.axiosInstance.post(`/apps/${appId}/start`);
        return response.data as ApplicationResponseData;
    }

    public stopApplication = async ({ appId }: { appId: string }): Promise<ApplicationResponseData> => {
        if (!appId || typeof appId !== "string") {
            throw new Error("Application ID (appId) must be a valid string.");
        }

        const response = await this.axiosInstance.post(`/apps/${appId}/stop`);
        return response.data as ApplicationResponseData;
    }

    public restartApplication = async ({ appId }: { appId: string }): Promise<ApplicationResponseData> => {
        if (!appId || typeof appId !== "string") {
            throw new Error("Application ID (appId) must be a valid string.");
        }

        const response = await this.axiosInstance.post(`/apps/${appId}/restart`);
        return response.data as ApplicationResponseData;
    }

    public uploadFile = async ({ appId, file, path }: { appId: string, file: Buffer, path?: string }): Promise<{ message: string } | AxiosError> => {
        if (!appId || typeof appId !== "string") {
            throw new Error("Application ID (appId) must be a valid string.");
        }

        if (path && typeof path !== "string") {
            throw new Error("File path must be a valid string.");
        }

        if (!file || !(file instanceof Buffer)) {
            throw new Error("File must be a valid Buffer.");
        }

        const formData = new FormData();
        formData.append("file", file, "file.zip");

        const response = await this.axiosInstance.post(`/apps/${appId}/upload?path=${path}`, formData, {
            headers: {
                ...formData.getHeaders(),
            }
        });

        return response.data as { message: string } || AxiosError;
    }

    public getMe = async (): Promise<UserData> => {
        const response = await this.axiosInstance.get("/users/@me");
        return response.data.user as UserData;
    }

    public getTeams = async (): Promise<TeamResponseData[]> => {
        const response = await this.axiosInstance.get("/teams");
        return response.data as TeamResponseData[];
    }

    public getTeam = async ({ teamId }: { teamId: string }): Promise<TeamResponseData> => {
        if (!teamId || typeof teamId !== "string") {
            throw new Error("Team ID (teamId) must be a valid string.");
        }

        const response = await this.axiosInstance.get(`/teams/${teamId}`);
        return response.data as TeamResponseData;
    }

    public downloadFile = async ({ appId, path }: { appId: string, path?: string }): Promise<Buffer> => {
        if (!appId || typeof appId !== "string") {
            throw new Error("Application ID (appId) must be a valid string.");
        }

        if (path && typeof path !== "string") {
            throw new Error("File path (path) must be a valid string.");
        }
        
        const queryParams = path ? `?path=${path}` : "";
        const response = await this.axiosInstance.get(`/apps/${appId}/download${queryParams}`, {
            responseType: "arraybuffer"
        })

        return response.data as Buffer;
    }
}