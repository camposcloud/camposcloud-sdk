import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ApplicationResponseData, CreateApplicationDataParams, UserData, TeamResponseData, UpdateApplicationDataParams } from "../types";

import FormData from "form-data";
import Application from "./Application";
import { AxiosError } from "axios";

export default class CamposCloudSDK {

    private apiToken: string;
    private axiosInstance: AxiosInstance;

    constructor({ apiToken }: { apiToken: string }) {
        if (!apiToken) {
            throw new Error("API Token is required to initialize CamposCloudSDK.");
        }

        this.apiToken = apiToken;
        this.axiosInstance = axios.create({
            baseURL: "https://api.camposcloud.com/v1/",
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
        const { file, appName, mainFile, memoryMB, runtimeEnvironment, exposedViaWeb, autoRestartEnabled, startupCommand, teamId, environmentVariables } = data;

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
        const { appId, appName, memoryMB, startupCommand, runtimeEnvironment, exposedViaWeb, autoRestartEnabled, environmentVariables } = data;

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

        const response = await this.axiosInstance.post(`/apps/${appId}/update`, payload);
        return response.data;
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
}