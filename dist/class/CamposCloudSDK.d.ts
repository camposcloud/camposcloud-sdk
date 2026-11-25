import { AxiosResponse } from "axios";
import { ApplicationResponseData, CreateApplicationDataParams, UserData, TeamResponseData, UpdateApplicationDataParams } from "../types";
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
export declare function getApiError(error: unknown): {
    status: number;
    error: string;
    code?: string;
    body: CamposCloudApiErrorBody;
} | null;
export default class CamposCloudSDK {
    private apiToken;
    private axiosInstance;
    /**
     * @param apiToken  your API key (a `cc_pat_...` token from the panel)
     * @param baseUrl   only to point the SDK at another server (for example a local control); defaults to production
     */
    constructor({ apiToken, baseUrl }: {
        apiToken: string;
        baseUrl?: string;
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
    /**
     * Confirms the pending custom domain of an application. First set it with `updateApplication`
     * (`assignedCustomDomain`), then publish the TXT record from `customDomainTxtName` / `customDomainTxtValue`.
     * Until the record propagates the API answers 400 with code "CUSTOM_DOMAIN_TXT_NOT_FOUND" (see `getApiError`).
     */
    verifyCustomDomain: ({ appId }: {
        appId: string;
    }) => Promise<{
        verified: boolean;
    }>;
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
    downloadFile: ({ appId, path }: {
        appId: string;
        path?: string;
    }) => Promise<Buffer>;
}
