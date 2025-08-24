"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const Application_1 = __importDefault(require("./Application"));
const axios_2 = require("axios");
class CamposCloudSDK {
    constructor({ apiToken }) {
        this.getApplication = (_a) => __awaiter(this, [_a], void 0, function* ({ appId }) {
            if (!appId || typeof appId !== "string") {
                throw new Error("Application ID (appId) must be a valid string.");
            }
            const response = yield this.axiosInstance.get(`/apps/${appId}`);
            return new Application_1.default(this, response.data);
        });
        this.getApplications = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axiosInstance.get("/apps");
            return response.data;
        });
        this.createApplication = (data) => __awaiter(this, void 0, void 0, function* () {
            const { file, appName, mainFile, memoryMB, runtimeEnvironment, exposedViaWeb, autoRestartEnabled, startupCommand, teamId, environmentVariables } = data;
            if (!file) {
                throw new Error("File is required to create an application.");
            }
            if (!appName) {
                throw new Error("Application name (appName) is required.");
            }
            if (!mainFile) {
                throw new Error("Main file (mainFile) is required.");
            }
            if (!memoryMB || isNaN(Number(memoryMB))) {
                throw new Error("Memory size (memoryMB) must be a valid number.");
            }
            if (!runtimeEnvironment) {
                throw new Error("Runtime environment (runtimeEnvironment) is required.");
            }
            if (environmentVariables) {
                environmentVariables.forEach(envVar => {
                    if (typeof envVar.key !== "string" || typeof envVar.value !== "string") {
                        throw new Error("Environment variable keys and values must be strings.");
                    }
                });
            }
            const formData = new form_data_1.default();
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
            const response = yield this.axiosInstance.post("/apps/create", formData, {
                headers: Object.assign({}, formData.getHeaders())
            });
            return new Application_1.default(this, response.data);
        });
        this.updateApplication = (data) => __awaiter(this, void 0, void 0, function* () {
            const { appId, appName, memoryMB, startupCommand, runtimeEnvironment, exposedViaWeb, autoRestartEnabled, environmentVariables, teamId } = data;
            if (!appId || typeof appId !== "string") {
                throw new Error("Application ID (appId) must be a valid string.");
            }
            if (!appName) {
                throw new Error("Application name (appName) is required.");
            }
            if (!memoryMB || isNaN(Number(memoryMB))) {
                throw new Error("Memory size (memoryMB) must be a valid number.");
            }
            if (!runtimeEnvironment) {
                throw new Error("Runtime environment (runtimeEnvironment) is required.");
            }
            if (environmentVariables) {
                environmentVariables.forEach(envVar => {
                    if (typeof envVar.key !== "string" || typeof envVar.value !== "string") {
                        throw new Error("Environment variable keys and values must be strings.");
                    }
                });
            }
            const payload = {
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
            const response = yield this.axiosInstance.put(`/apps/${appId}/update`, payload);
            return response.data;
        });
        this.deleteApplication = (_a) => __awaiter(this, [_a], void 0, function* ({ appId }) {
            if (!appId || typeof appId !== "string") {
                throw new Error("Application ID (appId) must be a valid string.");
            }
            const response = yield this.axiosInstance.delete(`/apps/${appId}/delete`);
            return response;
        });
        this.startApplication = (_a) => __awaiter(this, [_a], void 0, function* ({ appId }) {
            if (!appId || typeof appId !== "string") {
                throw new Error("Application ID (appId) must be a valid string.");
            }
            const response = yield this.axiosInstance.post(`/apps/${appId}/start`);
            return response.data;
        });
        this.stopApplication = (_a) => __awaiter(this, [_a], void 0, function* ({ appId }) {
            if (!appId || typeof appId !== "string") {
                throw new Error("Application ID (appId) must be a valid string.");
            }
            const response = yield this.axiosInstance.post(`/apps/${appId}/stop`);
            return response.data;
        });
        this.restartApplication = (_a) => __awaiter(this, [_a], void 0, function* ({ appId }) {
            if (!appId || typeof appId !== "string") {
                throw new Error("Application ID (appId) must be a valid string.");
            }
            const response = yield this.axiosInstance.post(`/apps/${appId}/restart`);
            return response.data;
        });
        this.uploadFile = (_a) => __awaiter(this, [_a], void 0, function* ({ appId, file, path }) {
            if (!appId || typeof appId !== "string") {
                throw new Error("Application ID (appId) must be a valid string.");
            }
            if (path && typeof path !== "string") {
                throw new Error("File path must be a valid string.");
            }
            if (!file || !(file instanceof Buffer)) {
                throw new Error("File must be a valid Buffer.");
            }
            const formData = new form_data_1.default();
            formData.append("file", file, "file.zip");
            const response = yield this.axiosInstance.post(`/apps/${appId}/upload?path=${path}`, formData, {
                headers: Object.assign({}, formData.getHeaders())
            });
            return response.data || axios_2.AxiosError;
        });
        this.getMe = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axiosInstance.get("/users/@me");
            return response.data.user;
        });
        this.getTeams = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.axiosInstance.get("/teams");
            return response.data;
        });
        this.getTeam = (_a) => __awaiter(this, [_a], void 0, function* ({ teamId }) {
            if (!teamId || typeof teamId !== "string") {
                throw new Error("Team ID (teamId) must be a valid string.");
            }
            const response = yield this.axiosInstance.get(`/teams/${teamId}`);
            return response.data;
        });
        if (!apiToken) {
            throw new Error("API Token is required to initialize CamposCloudSDK.");
        }
        this.apiToken = apiToken;
        this.axiosInstance = axios_1.default.create({
            baseURL: "https://api.camposcloud.com/v1/",
            headers: {
                Authorization: `Bearer ${this.apiToken}`,
                "Content-Type": "application/json"
            }
        });
    }
}
exports.default = CamposCloudSDK;
