"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Application {
    constructor(sdk, data) {
        this.sdk = sdk;
        this.data = data;
        this.start = () => this.sdk.startApplication({ appId: this.data._id });
        this.stop = () => this.sdk.stopApplication({ appId: this.data._id });
        this.restart = () => this.sdk.restartApplication({ appId: this.data._id });
        this.delete = () => this.sdk.deleteApplication({ appId: this.data._id });
        this.uploadFile = ({ file, path }) => this.sdk.uploadFile({ appId: this.data._id, file, path });
        this.downloadFile = ({ path } = {}) => this.sdk.downloadFile({ appId: this.data._id, path });
        this.verifyCustomDomain = () => this.sdk.verifyCustomDomain({ appId: this.data._id });
        this.update = (data) => {
            return this.sdk.updateApplication(Object.assign({ appId: this.data._id }, data));
        };
    }
}
exports.default = Application;
