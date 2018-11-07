"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "SendGrid",
    auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
    }
});
/**
 * GET /contact
 * Contact form page.
 */
exports.getContact = (req, res) => {
    res.render("contact", {
        title: "Contact"
    });
};
/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
exports.postContact = (req, res) => {
    req.assert("name", "Name cannot be blank").notEmpty();
    req.assert("email", "Email is not valid").isEmail();
    req.assert("message", "Message cannot be blank").notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        req.flash("errors", errors);
        return res.redirect("/contact");
    }
    const mailOptions = {
        to: "your@email.com",
        from: `${req.body.name} <${req.body.email}>`,
        subject: "Contact Form",
        text: req.body.message
    };
    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            req.flash("errors", { msg: err.message });
            return res.redirect("/contact");
        }
        req.flash("success", { msg: "Email has been sent successfully!" });
        res.redirect("/contact");
    });
};
//# sourceMappingURL=contact.js.map