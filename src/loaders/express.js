import express from "express";
import indexRoute from "../routes/index.route.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import initializePassport from "../config/passport.config.js";
import __dirname from "../tools/utils.js";
import cors from "cors";
import session from "express-session";
import errorHandler from "../middlewares/errorHandler.js";
import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";
import { addLogger } from "../tools/winstonLogger.js";
import { productsImgPath } from "../data/products/pathProducts.js";
import { profilesImgPath } from "../data/profiles/pathProfiles.js";


const corsOptions = {
    origin: "https://hector039.github.io/client55650/",
    credentials: true,
};

export default async function appLoader(app) {
    app.use(cookieParser(process.env.USERCOOKIESECRET));
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(__dirname + "/public"));
    app.use(express.static(productsImgPath));
    app.use(express.static(profilesImgPath));
    app.use(addLogger);
    app.use(session({
        secret: process.env.USERCOOKIESECRET,
        resave: false,
        saveUninitialized: true
    }));

    initializePassport();
    app.use(passport.initialize());
    app.use(passport.session());


    app.use("/", indexRoute);


    app.get("*", (req, res) => {
        CustomError.createError({
            name: "Ups!",
            cause: req.url,
            message: "La ruta que buscas no existe",
            code: TErrors.ROUTING,
        });
    });

    app.use(errorHandler);
    
    return app;
}