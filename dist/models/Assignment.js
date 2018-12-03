"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const assignmentSchema = new mongoose_1.Schema({
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
    // updatedAt: Date,
    dueDate: {
        type: Date,
        required: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    note: {
        type: String
    }
});
exports.default = mongoose_1.model("Assignment", assignmentSchema);
//# sourceMappingURL=Assignment.js.map