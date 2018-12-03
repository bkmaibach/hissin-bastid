import { Request, Response, NextFunction } from "express";
import { default as Assignment } from "../models/Assignment";
import * as assignmentHelpers from "../data/assignments";

/**
 * GET /
 * Home page.
 */
export let index = (req: Request, res: Response) => {
  res.render("home", {
    title: "Home"
  });
};

