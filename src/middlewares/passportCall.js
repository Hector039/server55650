import passport from "passport";

export const passportCall = strategy => {
    return async (req, res, next) => {
        passport.authenticate(strategy,
            {
                successRedirect: "http://localhost:5173/",
                failureRedirect: "http://localhost:5173/account"
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