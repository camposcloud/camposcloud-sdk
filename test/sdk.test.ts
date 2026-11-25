// Testes do SDK sem rede: o adaptador do axios é trocado por um que guarda a requisição e devolve uma resposta pronta.
// npm run test:unit
import test from "node:test";
import assert from "node:assert/strict";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import CamposCloudSDK, { getApiError, TEAM_PERMISSION_KEYS, type TeamPermissions } from "../src/index";

const APP_ID = "507f1f77bcf86cd799439011";

function sdkWith(reply: (config: InternalAxiosRequestConfig) => { status: number; data: unknown }) {
    const sdk = new CamposCloudSDK({ apiToken: "cc_pat_test" });
    const calls: InternalAxiosRequestConfig[] = [];
    (sdk as any).axiosInstance.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
        calls.push(config);
        const { status, data } = reply(config);
        const response = { status, data, statusText: String(status), headers: {}, config };
        if (status >= 400) throw new AxiosError(`HTTP ${status}`, String(status), config, null, response as any);
        return response;
    };
    return { sdk, calls };
}

const body = (config: InternalAxiosRequestConfig) => JSON.parse(String(config.data));
const base = { appId: APP_ID, appName: "my-app", memoryMB: 512, runtimeEnvironment: "nodejs" as const };

test("update: build command, main file and custom domain are sent only when given", async () => {
    const { sdk, calls } = sdkWith(() => ({ status: 200, data: {} }));

    await sdk.updateApplication(base);
    const plain = body(calls[0]);
    assert.equal("buildCommand" in plain, false);
    assert.equal("mainFile" in plain, false);
    assert.equal("assignedCustomDomain" in plain, false);

    await sdk.updateApplication({ ...base, buildCommand: "npm run build", mainFile: "src/index.js", assignedCustomDomain: "app.example.com" });
    assert.deepEqual(
        { buildCommand: body(calls[1]).buildCommand, mainFile: body(calls[1]).mainFile, assignedCustomDomain: body(calls[1]).assignedCustomDomain },
        { buildCommand: "npm run build", mainFile: "src/index.js", assignedCustomDomain: "app.example.com" },
    );
    assert.equal(calls[1].url, `/apps/${APP_ID}/update`);
});

test("update: an empty build command or domain is sent, because it removes them", async () => {
    const { sdk, calls } = sdkWith(() => ({ status: 200, data: {} }));
    await sdk.updateApplication({ ...base, buildCommand: "", assignedCustomDomain: "" });
    assert.equal(body(calls[0]).buildCommand, "");
    assert.equal(body(calls[0]).assignedCustomDomain, "");
});

test("update: wrong types are refused before any request", async () => {
    const { sdk, calls } = sdkWith(() => ({ status: 200, data: {} }));
    await assert.rejects(sdk.updateApplication({ ...base, mainFile: "   " }), /mainFile/);
    await assert.rejects(sdk.updateApplication({ ...base, buildCommand: { $ne: "" } as unknown as string }), /buildCommand/);
    await assert.rejects(sdk.updateApplication({ ...base, assignedCustomDomain: 1 as unknown as string }), /assignedCustomDomain/);
    assert.equal(calls.length, 0);
});

test("create: the build command goes in the form", async () => {
    const { sdk, calls } = sdkWith(() => ({ status: 200, data: { _id: APP_ID } }));
    await sdk.createApplication({ file: Buffer.from("PK"), appName: "my-app", mainFile: "index.js", memoryMB: 256, runtimeEnvironment: "bun", buildCommand: "bun run build" });
    const form = (calls[0].data as { getBuffer(): Buffer }).getBuffer().toString("utf8");
    assert.match(form, /name="buildCommand"\r\n\r\nbun run build\r\n/);
    assert.match(form, /name="runtimeEnvironment"\r\n\r\nbun\r\n/);
});

test("verifyCustomDomain: POSTs to the application's verify route, with the id encoded", async () => {
    const { sdk, calls } = sdkWith(() => ({ status: 200, data: { verified: true } }));
    assert.deepEqual(await sdk.verifyCustomDomain({ appId: APP_ID }), { verified: true });
    assert.equal(calls[0].method, "post");
    assert.equal(calls[0].url, `/apps/${APP_ID}/custom-domain/verify`);

    await sdk.verifyCustomDomain({ appId: "../users/@me" });
    assert.equal(calls[1].url, "/apps/..%2Fusers%2F%40me/custom-domain/verify");
    await assert.rejects(sdk.verifyCustomDomain({ appId: "" }), /appId/);
});

test("getApiError: the status, the message and the stable code of an API error", async () => {
    const { sdk } = sdkWith(() => ({ status: 400, data: { error: "Não encontramos o registro TXT.", code: "CUSTOM_DOMAIN_TXT_NOT_FOUND" } }));
    const error = await sdk.verifyCustomDomain({ appId: APP_ID }).catch((e) => e);
    assert.deepEqual(getApiError(error) && { status: getApiError(error)!.status, code: getApiError(error)!.code }, { status: 400, code: "CUSTOM_DOMAIN_TXT_NOT_FOUND" });
    assert.equal(getApiError(error)!.error, "Não encontramos o registro TXT.");
});

test("getApiError: errors without a code, without a body, or that never reached the API", async () => {
    const { sdk } = sdkWith(() => ({ status: 404, data: { error: "Application not found." } }));
    const notFound = getApiError(await sdk.getApplication({ appId: APP_ID }).catch((e) => e));
    assert.equal(notFound!.status, 404);
    assert.equal(notFound!.code, undefined);

    const { sdk: html } = sdkWith(() => ({ status: 502, data: "<html>Bad gateway</html>" }));
    assert.equal(getApiError(await html.getMe().catch((e) => e))!.error, "HTTP 502");

    assert.equal(getApiError(new Error("socket hang up")), null);
    assert.equal(getApiError(undefined), null);
});

test("team permissions: the 19 keys, each once", () => {
    assert.equal(TEAM_PERMISSION_KEYS.length, 19);
    assert.equal(new Set(TEAM_PERMISSION_KEYS).size, 19);
    // Compile-time check: every key of TeamPermissions is in the list.
    const all: Record<keyof TeamPermissions, true> = Object.fromEntries(TEAM_PERMISSION_KEYS.map((key) => [key, true])) as Record<keyof TeamPermissions, true>;
    for (const key of ["canSeeApplicationLogs", "canManageMembers", "canSeeDatabaseCredentials"] as const) assert.equal(all[key], true);
});
