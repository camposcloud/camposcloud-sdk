import axios from "axios";
import { ApplicationResponseData, CreateApplicationDataParams, UserData } from "../types";
import Application from "./Application";
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
    deleteApplication: ({ appId }: {
        appId: string;
    }) => Promise<axios.AxiosResponse<any, any>>;
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
    }>;
    getMe: () => Promise<UserData>;
}
