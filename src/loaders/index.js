import appLoader from "./express.js";

export default async (app) => {
    await appLoader(app);
    console.log("Express iniciado");
}
