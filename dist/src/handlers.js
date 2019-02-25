"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Don't worry about anything in this file,
 * focus on writing your snake logic in index.js endpoints.
 */
exports.poweredByHandler = (req, res, next) => {
    res.setHeader("X-Powered-By", "BattleSnake");
    next();
};
exports.fallbackHandler = (req, res, next) => {
    // Short-circuit favicon requests
    if (req.url === "/favicon.ico") {
        res.set({ "Content-Type": "image/x-icon" });
        res.status(200);
        res.end();
        return next();
    }
    // Reroute all 404 routes to the 404 handler
    const err = new Error();
    err.message = "404";
    return next(err);
};
exports.notFoundHandler = (err, req, res, next) => {
    if (err.message !== "404") {
        return next(err);
    }
    res.status(404);
    return res.send({
        status: 404,
        error: err.message || "These are not the snakes you're looking for",
    });
};
exports.genericErrorHandler = (err, req, res, next) => {
    const statusCode = err.message || "500";
    res.status(parseInt(statusCode));
    return res.send({
        status: statusCode,
        error: err,
    });
};
//# sourceMappingURL=handlers.js.map