
export const customResponses = (req, res, next) => {
    res.sendSuccess = payload => res.send({ status: "Success", payload });
    res.sendUserError = userError => res.status(400).send({ status: "UserError", userError });
    res.sendServerError = serverError => res.status(500).send({ status: "ServerError", serverError });
    next();
}