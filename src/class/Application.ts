import { ApplicationResponseData } from "../types";
import CamposCloudSDK from "./CamposCloudSDK";

class Application {
    constructor(
        private sdk: CamposCloudSDK,
        public readonly data: ApplicationResponseData
    ) {}

    start = () => this.sdk.startApplication({ appId: this.data._id });
    stop = () => this.sdk.stopApplication({ appId: this.data._id });
    restart = () => this.sdk.restartApplication({ appId: this.data._id });
    delete = () => this.sdk.deleteApplication({ appId: this.data._id });
    uploadFile = ({ file, path }: { file: Buffer, path?: string }) => this.sdk.uploadFile({ appId: this.data._id, file, path });
}

export default Application;