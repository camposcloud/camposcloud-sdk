// SDK contra uma API falsa: nenhuma requisição sai da máquina.  npm test
import test, { describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { builtinModules } from "node:module";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import CamposCloudSDK, { Application } from "../src/index";

type Respond = (config: InternalAxiosRequestConfig) => unknown;

/** SDK com o adapter do axios trocado: cada requisição fica em `calls` e recebe o que `respond` devolver. */
function setup(respond: Respond = () => ({})) {
    const sdk = new CamposCloudSDK({ apiToken: "token-de-teste" });
    const calls: InternalAxiosRequestConfig[] = [];
    (sdk as any).axiosInstance.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
        calls.push(config);
        return { data: respond(config), status: 200, statusText: "OK", headers: {}, config, request: {} };
    };
    return { sdk, calls };
}

/** O texto do corpo multipart enviado. */
const multipart = (config: InternalAxiosRequestConfig) => (config.data as any).getBuffer().toString("utf8");
const field = (body: string, name: string) => body.match(new RegExp(`name="${name}"\\r\\n\\r\\n([^\\r]*)`))?.[1];

const app = { _id: "app123", name: "meu-app" };
const validCreate = { file: Buffer.from("zip"), appName: "meu-app", mainFile: "index.js", memoryMB: 512, runtimeEnvironment: "nodejs" } as any;
const validUpdate = { appId: "app123", appName: "novo-nome", memoryMB: 1024, runtimeEnvironment: "nodejs" } as any;

describe("cliente", () => {
    test("exige o token e o envia como Bearer para a API v1", () => {
        assert.throws(() => new CamposCloudSDK({ apiToken: "" }), /API Token is required/);
        const { sdk } = setup();
        const defaults = (sdk as any).axiosInstance.defaults;
        assert.equal(defaults.baseURL, "https://api.camposcloud.com/v1/");
        assert.equal(defaults.headers.Authorization, "Bearer token-de-teste");
    });

    test("erros da API chegam a quem chamou", async () => {
        const { sdk } = setup();
        (sdk as any).axiosInstance.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
            throw new AxiosError("Not Found", "ERR_BAD_REQUEST", config, {}, { status: 404, data: { error: "Application not found" } } as any);
        };
        await assert.rejects(sdk.getApplication({ appId: "nope" }), (error: any) => error.response.status === 404);
    });
});

describe("aplicações", () => {
    test("getApplication busca /apps/:id e devolve um Application com os dados", async () => {
        const { sdk, calls } = setup(() => app);
        const result = await sdk.getApplication({ appId: "app123" });
        assert.equal(calls[0].method, "get");
        assert.equal(calls[0].url, "/apps/app123");
        assert.ok(result instanceof Application);
        assert.deepEqual(result.data, app);
    });

    test("métodos que exigem appId recusam sem chamar a API", async () => {
        const { sdk, calls } = setup();
        for (const call of [
            () => sdk.getApplication({ appId: "" }),
            () => sdk.startApplication({ appId: 123 as any }),
            () => sdk.stopApplication({ appId: undefined as any }),
            () => sdk.restartApplication({ appId: "" }),
            () => sdk.deleteApplication({ appId: "" }),
            () => sdk.downloadFile({ appId: "" }),
        ]) {
            await assert.rejects(call(), /appId/);
        }
        assert.equal(calls.length, 0);
    });

    test("ligar, desligar, reiniciar e excluir usam a rota e o método certos", async () => {
        const { sdk, calls } = setup(() => app);
        await sdk.startApplication({ appId: "a1" });
        await sdk.stopApplication({ appId: "a1" });
        await sdk.restartApplication({ appId: "a1" });
        await sdk.deleteApplication({ appId: "a1" });
        assert.deepEqual(calls.map(c => `${c.method} ${c.url}`), [
            "post /apps/a1/start", "post /apps/a1/stop", "post /apps/a1/restart", "delete /apps/a1/delete",
        ]);
    });

    test("Application atua sobre o próprio ID", async () => {
        const { sdk, calls } = setup(() => app);
        const application = await sdk.getApplication({ appId: "app123" });
        await application.start();
        await application.restart();
        await application.update({ appName: "x", memoryMB: 256, runtimeEnvironment: "nodejs" } as any);
        assert.deepEqual(calls.slice(1).map(c => c.url), ["/apps/app123/start", "/apps/app123/restart", "/apps/app123/update"]);
    });

    test("getApplications lista /apps", async () => {
        const { sdk, calls } = setup(() => ({ applications: [app], totalUsedRAM: "512MB", pagination: {} }));
        const result = await sdk.getApplications();
        assert.equal(calls[0].url, "/apps");
        assert.equal(result.applications[0]._id, "app123");
    });
});

describe("createApplication", () => {
    test("campos obrigatórios e tipos são conferidos antes de enviar", async () => {
        const { sdk, calls } = setup();
        const cases: [object, RegExp][] = [
            [{ file: undefined }, /File is required/],
            [{ appName: "" }, /appName/],
            [{ mainFile: "" }, /mainFile/],
            [{ memoryMB: "muito" }, /memoryMB/],
            [{ memoryMB: 0 }, /memoryMB/],
            [{ runtimeEnvironment: "" }, /runtimeEnvironment/],
            [{ environmentVariables: [{ key: "A", value: 1 }] }, /must be strings/],
        ];
        for (const [override, error] of cases) {
            await assert.rejects(sdk.createApplication({ ...validCreate, ...override }), error);
        }
        assert.equal(calls.length, 0);
    });

    test("envia o zip e os campos como multipart para /apps/create", async () => {
        const { sdk, calls } = setup(() => app);
        const result = await sdk.createApplication({
            ...validCreate,
            exposedViaWeb: false,
            autoRestartEnabled: true,
            startupCommand: "npm start",
            teamId: "team9",
            environmentVariables: [{ key: "TOKEN", value: "abc" }],
        });
        const call = calls[0];
        assert.equal(`${call.method} ${call.url}`, "post /apps/create");
        assert.match(String(call.headers["content-type"] ?? call.headers["Content-Type"]), /^multipart\/form-data; boundary=/);

        const body = multipart(call);
        assert.match(body, /name="file"; filename="file.zip"/);
        assert.equal(field(body, "appName"), "meu-app");
        assert.equal(field(body, "memoryMB"), "512");
        assert.equal(field(body, "exposedViaWeb"), "false");
        assert.equal(field(body, "autoRestartEnabled"), "true");
        assert.equal(field(body, "team"), "team9");
        assert.deepEqual(JSON.parse(field(body, "environmentVariables")!), [{ key: "TOKEN", value: "abc" }]);
        assert.ok(result instanceof Application);
    });

    test("campos opcionais ausentes não são enviados", async () => {
        const { sdk, calls } = setup(() => app);
        await sdk.createApplication(validCreate);
        const body = multipart(calls[0]);
        for (const name of ["exposedViaWeb", "autoRestartEnabled", "startupCommand", "team", "environmentVariables"]) {
            assert.equal(field(body, name), undefined, name);
        }
    });
});

describe("updateApplication", () => {
    test("confere os campos e envia só o que foi informado", async () => {
        const { sdk, calls } = setup(() => app);
        await assert.rejects(sdk.updateApplication({ ...validUpdate, appName: "" }), /appName/);
        await assert.rejects(sdk.updateApplication({ ...validUpdate, memoryMB: "x" }), /memoryMB/);
        assert.equal(calls.length, 0);

        await sdk.updateApplication({ ...validUpdate, autoRestartEnabled: false });
        assert.equal(`${calls[0].method} ${calls[0].url}`, "post /apps/app123/update");
        assert.deepEqual(JSON.parse(calls[0].data), { appName: "novo-nome", memoryMB: 1024, runtimeEnvironment: "nodejs", autoRestartEnabled: false });
    });
});

describe("arquivos", () => {
    test("uploadFile exige um Buffer e envia para a pasta pedida", async () => {
        const { sdk, calls } = setup(() => ({ message: "ok" }));
        await assert.rejects(sdk.uploadFile({ appId: "a1", file: "texto" as any }), /Buffer/);
        assert.deepEqual(await sdk.uploadFile({ appId: "a1", file: Buffer.from("x"), path: "/src" }), { message: "ok" });
        assert.equal(calls[0].url, "/apps/a1/upload?path=%2Fsrc");
    });

    test("uploadFile sem pasta envia para a raiz, sem 'path=undefined'", async () => {
        const { sdk, calls } = setup(() => ({ message: "ok" }));
        await sdk.uploadFile({ appId: "a1", file: Buffer.from("x") });
        assert.doesNotMatch(String(calls[0].url), /undefined/);
    });

    test("downloadFile baixa como binário, com ou sem pasta", async () => {
        const { sdk, calls } = setup(() => Buffer.from("zip"));
        await sdk.downloadFile({ appId: "a1" });
        await sdk.downloadFile({ appId: "a1", path: "/src" });
        assert.equal(calls[0].url, "/apps/a1/download");
        assert.equal(calls[1].url, "/apps/a1/download?path=%2Fsrc");
        assert.equal(calls[0].responseType, "arraybuffer");
    });

    test("caminhos com caracteres especiais vão codificados na URL", async () => {
        const { sdk, calls } = setup(() => Buffer.from(""));
        await sdk.downloadFile({ appId: "a1", path: "/notas & ideias #1.txt" });
        const url = new URL(String(calls[0].url), "https://api.test/");
        assert.equal(url.searchParams.get("path"), "/notas & ideias #1.txt");
    });
});

describe("conta e times", () => {
    test("getMe devolve o usuário; getTeams e getTeam leem /teams", async () => {
        const { sdk, calls } = setup(config => (config.url === "/users/@me" ? { user: { name: "Ana" } } : [{ _id: "t1" }]));
        assert.deepEqual(await sdk.getMe(), { name: "Ana" });
        await sdk.getTeams();
        await sdk.getTeam({ teamId: "t1" });
        await assert.rejects(sdk.getTeam({ teamId: "" }), /teamId/);
        assert.deepEqual(calls.map(c => c.url), ["/users/@me", "/teams", "/teams/t1"]);
    });
});

describe("pacote", () => {
    test("todo pacote importado pelo SDK está nas dependencies", () => {
        const root = path.resolve(__dirname, "..");
        const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
        const declared = new Set(Object.keys(pkg.dependencies ?? {}));
        const files = fs.readdirSync(path.join(root, "src"), { recursive: true, withFileTypes: true })
            .filter(entry => entry.isFile() && entry.name.endsWith(".ts") && !entry.parentPath.includes(`${path.sep}test`));
        const missing = new Set<string>();
        for (const entry of files) {
            const source = fs.readFileSync(path.join(entry.parentPath, entry.name), "utf8");
            for (const [, spec] of source.matchAll(/from\s+["']([^"'.][^"']*)["']/g)) {
                const name = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
                if (!builtinModules.includes(name) && !name.startsWith("node:") && !declared.has(name)) missing.add(name);
            }
        }
        assert.deepEqual([...missing], []);
    });
});
