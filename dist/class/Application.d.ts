import { ApplicationResponseData, UpdateApplicationDataParams } from "../types";
import CamposCloudSDK from "./CamposCloudSDK";
declare class Application {
    private sdk;
    readonly data: ApplicationResponseData;
    constructor(sdk: CamposCloudSDK, data: ApplicationResponseData);
    start: () => Promise<ApplicationResponseData>;
    stop: () => Promise<ApplicationResponseData>;
    restart: () => Promise<ApplicationResponseData>;
    delete: () => Promise<import("axios").AxiosResponse<any, any>>;
    uploadFile: ({ file, path }: {
        file: Buffer;
        path?: string;
    }) => Promise<{
        message: string;
    } | import("axios").AxiosStatic.AxiosError>;
    updateApplication: (data: Omit<UpdateApplicationDataParams, "appId">) => Promise<ApplicationResponseData>;
}
export default Application;
