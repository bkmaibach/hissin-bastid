import express from "express";
/**
 * Don't worry about anything in this file,
 * focus on writing your snake logic in index.js endpoints.
 */

export const poweredByHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.setHeader("X-Powered-By", "BattleSnake");
  next();
};

export const fallbackHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Short-circuit favicon requests
  if (req.url === "/favicon.ico") {
    res.set({"Content-Type": "image/x-icon"});
    res.status(200);
    res.end();
    return next();
  }

  // Reroute all 404 routes to the 404 handler
const err = new Error();
  err.message = "404";
  return next(err);
};

export const notFoundHandler = (err: Error , req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.message !== "404") {
    return next(err);
  }

  res.status(404);
  return res.send({
    status: 404,
    error: err.message || "These are not the snakes you're looking for",
  });
};

export const genericErrorHandler = (err: Error , req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.message || "500";
  res.status(parseInt(statusCode));
  return res.send({
    status: statusCode,
    error: err,
  });
};