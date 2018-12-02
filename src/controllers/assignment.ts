
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator/check";
import { sanitizeBody } from "express-validator/filter";
import { default as Assignment } from "../models/Assignment";
import * as assignmentHelpers from "../data/assignments";
/**
 * /api/assignments
 * Assignments API
 */
export let postHome = async (req: Request, res: Response, next: NextFunction) => {
    req.assert("course", "Invalid course").isIn(["ITAS155", "ITAS191", "ITAS167", "ITAS185"]);

    req.assert("assignmentName", "Assignment name invalid").isLength({ min: 1, max: 64 }).trim().withMessage("Name invalid");
    req.sanitize("assignmentName").trim();
    req.sanitize("assignmentName").escape();

    req.assert("dueDate", "Invalid date").isISO8601().trim().withMessage("Date invalid");

    req.assert("dueTime", "Invalid time").trim().withMessage("Time invalid");

    req.assert("url", "Invalid URL").isURL().isLength({ min: 1, max: 128 }).trim().withMessage("URL invalid");
    req.sanitize("url").trim();

    req.sanitize("note").trim();
    req.sanitize("note").escape();

    const errors = req.validationErrors();

    if (errors) {
        req.flash("errors", errors);
        return res.redirect("/");
    }

    const course = req.body.course;
    const assignmentName = req.body.assignmentName;
    const dueDate = new Date(Date.parse(req.body.dueDate + " " + req.body.dueTime + " PST"));
    const url = req.body.url;
    const note = req.body.note;

    try {
        const result = await assignmentHelpers.create(course, assignmentName, dueDate, url, note);
        if (result) {
          req.flash("success", {msg: "Assignment created successfully"});
          res.redirect(req.session.returnTo || "/");
        } else {
          req.flash("errors", {msg: "Assignment creation failed"});
          return res.redirect("/");
        }
    } catch (err) {
        return next(err);
    }
  };

export let readAssignments = (req: Request, res: Response, next: NextFunction) => {

};

export let updateAssignments = (req: Request, res: Response, next: NextFunction) => {

};

export let deleteAssignments = (req: Request, res: Response, next: NextFunction) => {

};