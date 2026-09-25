const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokanCookieValue = req.cookies[cookieName];
        if(!tokanCookieValue) {
            return next();
        }

        try {
            const userPayload = validateToken(tokanCookieValue);
            req.user = userPayload;
        } catch (error) {}
        return next();
    };
}


module.exports = {
    checkForAuthenticationCookie,
}