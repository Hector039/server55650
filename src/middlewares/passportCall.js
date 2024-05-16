import passport from "passport";

export const passportCall = strategy => {
    return async (req, res, next) => {
        passport.authenticate(strategy,
            {
                successRedirect: "https://hector039.github.io/client55650/",
                failureRedirect: "https://hector039.github.io/client55650/account"
            },
            function (error, user, info) {
                if (error) return next(error);
                if (!user) {
                    return res.status(401).send({ error: info.messages ? info.messages : info.toString() });
                }
                req.user = user;
                next();
            })(req, res, next);
    }
}