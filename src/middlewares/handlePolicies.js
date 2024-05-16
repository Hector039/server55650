import getEnvironment from "../config/process.config.js";

const env = getEnvironment();

export const handlePolicies = policies => (req, res, next) => {
    if (policies[0] === "PUBLIC") return next();
    if (req.user === null) return res.status(401).send({ status: "Error", error: "Unautorized" })
    if (policies.includes(req.user.role.toUpperCase()) === false) return res.status(403).send({ status: "Error", error: "Wrong credentials" });
    next();
}
