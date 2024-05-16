import winston from "winston";
import getEnvironment from "../config/process.config.js";
import __dirname from "./utils.js";

const env = getEnvironment();
const { combine, timestamp, printf, align } = winston.format;

const environtmentMode = () => {
    if (env.MODE === "development") return "debug";
    else if (env.MODE === "production") return "info";
    else return new Error("Invalid Environment Mode");
}

const logLevelsOpts = { fatal: 0, error: 1, warning: 2, info: 3, http: 4, debug: 5 }

const logger = winston.createLogger({
    levels: logLevelsOpts,
    format: combine( 
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
        align(),
        printf((info) => `${info.level}: ${info.message} --- [${info.timestamp}]`),
    ),
    transports: [
        new winston.transports.Console({ level: environtmentMode() }),
        new winston.transports.File({ filename: `${__dirname}/errors.log`, level: "error" })
    ]
})

export const addLogger = (req, res, next) => {
    req.logger = logger;
    next();
};