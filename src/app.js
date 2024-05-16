import loaders from "./loaders/index.js";
import express from "express";

async function startServer() {

    const app = express();

    await loaders(app);
    

    app.listen(process.env.PORT, err => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(`Servidor escuchando en puerto ${process.env.PORT}`);
    });

}

startServer();