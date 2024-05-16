import loaders from "./loaders/index.js";
import express from "express";
import getEnvironment from "./config/process.config.js";

async function startServer() {

    const env = getEnvironment();
    const app = express();

    await loaders(app);
    

    app.listen(env.PORT, err => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(`Servidor escuchando en puerto ${env.PORT} en modo ${env.MODE} y persistencia en ${env.PERSISTENCE}`);
    });

}

startServer();