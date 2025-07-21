import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ApplicationResponseData, CreateApplicationDataParams, UserData } from "../types";

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

    public getApplication = async ({ appId }: { appId: string }) => {
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

    public createApplication = async (data: CreateApplicationDataParams) => {
        const { file, appName, mainFile, memoryMB, runtimeEnvironment, exposedViaWeb, autoRestartEnabled, startupCommand, teamId } = data;

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
 
        const formData = new FormData();
        formData.append("file", file, "file.zip");
        formData.append("appName", appName);
        formData.append("mainFile", mainFile);
        formData.append("memoryMB", memoryMB);
        formData.append("runtimeEnvironment", runtimeEnvironment);

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
            formData.append("teamId", teamId);
        }

        const response = await this.axiosInstance.post("/apps/create", formData, {
            headers: {
                ...formData.getHeaders(),
            }
        });

        return new Application(this, response.data as ApplicationResponseData);
    }

    public deleteApplication = async ({ appId }: { appId: string }) => {
        if (!appId || typeof appId !== "string") {
            throw new Error("Application ID (appId) must be a valid string.");
        }

        const response = await this.axiosInstance.delete(`/apps/${appId}/delete`)
        return response as AxiosResponse;
    }

    public startApplication = async ({ appId }: { appId: string }) => {
        if (!appId || typeof appId !== "string") {
            throw new Error("Application ID (appId) must be a valid string.");
        }

        const response = await this.axiosInstance.post(`/apps/${appId}/start`);
        return response.data as ApplicationResponseData;
    }

    public stopApplication = async ({ appId }: { appId: string }) => {
        if (!appId || typeof appId !== "string") {
            throw new Error("Application ID (appId) must be a valid string.");
        }

        const response = await this.axiosInstance.post(`/apps/${appId}/stop`);
        return response.data as ApplicationResponseData;
    }

    public restartApplication = async ({ appId }: { appId: string }) => {
        if (!appId || typeof appId !== "string") {
            throw new Error("Application ID (appId) must be a valid string.");
        }

        const response = await this.axiosInstance.post(`/apps/${appId}/restart`);
        return response.data as ApplicationResponseData;
    }

    public uploadFile = async ({ appId, file, path }: { appId: string, file: Buffer, path?: string }) => {
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

    public getMe = async () => {
        const response = await this.axiosInstance.get("/users/@me");
        return response.data.user as UserData;
    }
}