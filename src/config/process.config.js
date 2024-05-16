import { Command } from "commander";
import dotenv from "dotenv";

const getEnvironment = () => {

    const application = new Command();

    application
        .option("--mode <mode>", "Modo de trabajo", "DEVELOPMENT")
        .option("--persistence <persistence>", "Tipo de persistencia", "DATABASE")
        .requiredOption("-u <user>", "Nombre de usuario", "No se declaró usuario")
        .requiredOption("-p <pass>", "Password de usuario", "No se declaró password usuario")
    application.parse();

    const options = application.opts();

    dotenv.config({
        path: options.mode.toUpperCase() === "DEVELOPMENT" ? "src/config/.env.development" : "src/config/.env.production",
    });

    if (options.u !== process.env.ADMIN_NAME && options.p !== process.env.ADMIN_PASSWORD) {
        return console.log("Usuario o contraseña incorrectos.");
    }

    return {
        MODE: process.env.MODE,
        PERSISTENCE: options.persistence.toUpperCase(),
        DB_URL: process.env.DB_URL,
        PORT: process.env.PORT,
        USERCOOKIESECRET: process.env.USERCOOKIESECRET,
        GH_APP_ID: process.env.GH_APP_ID,
        GH_CLIENT_ID: process.env.GH_CLIENT_ID,
        GH_CLIENT_SECRETS: process.env.GH_CLIENT_SECRETS,
        GH_CALLBACK_URL: process.env.GH_CALLBACK_URL,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
        MAILER_USER: process.env.MAILER_USER,
        MAILER_PASSWORD: process.env.MAILER_PASSWORD,
        MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN,
        NGROK_TOKEN: process.env.NGROK_TOKEN
};
};

export default getEnvironment;
