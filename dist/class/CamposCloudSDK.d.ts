import { AxiosResponse } from "axios";
import { ApplicationResponseData, CreateApplicationDataParams, UserData, TeamResponseData, UpdateApplicationDataParams } from "../types";
import Application from "./Application";
import { AxiosError } from "axios";
export default class CamposCloudSDK {
    private apiToken;
    private axiosInstance;
    constructor({ apiToken }: {
        apiToken: string;
    });
    getApplication: ({ appId }: {
        appId: string;
    }) => Promise<Application>;
    getApplications: () => Promise<{
        applications: ApplicationResponseData[];
        totalUsedRAM: string;
        pagination: {
            totalItems: number;
            totalPages: number;
            currentPage: number;
            itemsPerPage: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    createApplication: (data: CreateApplicationDataParams) => Promise<Application>;
    updateApplication: (data: UpdateApplicationDataParams) => Promise<ApplicationResponseData>;
    deleteApplication: ({ appId }: {
        appId: string;
    }) => Promise<AxiosResponse>;
    startApplication: ({ appId }: {
        appId: string;
    }) => Promise<ApplicationResponseData>;
    stopApplication: ({ appId }: {
        appId: string;
    }) => Promise<ApplicationResponseData>;
    restartApplication: ({ appId }: {
        appId: string;
    }) => Promise<ApplicationResponseData>;
    uploadFile: ({ appId, file, path }: {
        appId: string;
        file: Buffer;
        path?: string;
    }) => Promise<{
        message: string;
    } | AxiosError>;
    getMe: () => Promise<UserData>;
    getTeams: () => Promise<TeamResponseData[]>;
    getTeam: ({ teamId }: {
        teamId: string;
    }) => Promise<TeamResponseData>;
}
