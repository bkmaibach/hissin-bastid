"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assignmentHelpers = __importStar(require("../data/assignments"));
/**
 * /api/assignments
 * Assignments API
 */
exports.postHome = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
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
        const result = yield assignmentHelpers.create(course, assignmentName, dueDate, url, note);
        if (result) {
            req.flash("success", { msg: "Assignment created successfully" });
            res.redirect(req.session.returnTo || "/");
        }
        else {
            req.flash("errors", { msg: "Assignment creation failed" });
            return res.redirect("/");
        }
    }
    catch (err) {
        return next(err);
    }
});
exports.readAssignments = (req, res, next) => {
};
exports.updateAssignments = (req, res, next) => {
};
exports.deleteAssignments = (req, res, next) => {
};
//# sourceMappingURL=assignment.js.map