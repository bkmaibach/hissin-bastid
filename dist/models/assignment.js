"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AssignmentSchema = new mongoose_1.Schema({
    course: {
        type: String,
        required: true,
        enum: ["ITAS155", "ITAS191", "ITAS167", "ITAS185"],
        trim: true
    },
    name: {
        type: String,
        required: true,
        minLength: 1,
        unique: true,
        trim: true
    },
    createdAt: Date,
    updatedAt: Date,
    dueDate: {
        type: Date,
        required: true
    },
    percentOfGrade: {
        type: Number
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["report", "exam"],
        required: true
    },
    note: {
        type: String
    }
});
exports.default = mongoose_1.model("Assignment", AssignmentSchema);
//# sourceMappingURL=assignment.js.map