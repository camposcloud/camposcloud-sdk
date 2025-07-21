import CamposCloudSDK from "class/CamposCloudSDK";

const api = new CamposCloudSDK({ apiToken: "You-Token-Here" });

const main = async () => {
    const me = await api.getMe();
    console.log(`Hello ${me.name} 👋`);
}

main();