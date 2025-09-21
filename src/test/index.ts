import CamposCloudSDK from "../index";
import dotenv from "dotenv";

dotenv.config();

const api = new CamposCloudSDK({ apiToken: process.env.API_KEY! });

const main = async () => {
    try {
        const me = await api.getMe();
        console.log(`Hello ${me.name} 👋`);
    } catch (error) {
        console.error(error);
    }
}

main();