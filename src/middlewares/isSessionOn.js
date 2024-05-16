export const isSessionOn = () => {
    return async (req, res, next) => {
        const token = req.cookies.cookieToken;
        if (token === undefined) {
            next();
        } else {
            res.redirect("/");
        }
    }
}