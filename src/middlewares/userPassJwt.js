import jwt from "jsonwebtoken";
import getEnvironment from "../config/process.config.js";

const env = getEnvironment();

export const userPassJwt = () => {
    return async (req, res, next) => {
        const token = req.cookies.cookieToken;
        if (token !== undefined) {
            const user = jwt.verify(token, env.USERCOOKIESECRET);
            req.user = user;
        } else {
            req.user = null;
        }
        next();
    }
}