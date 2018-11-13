"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const assignmentSchema = new mongoose_1.Schema({
    dueDate: Date,
    percentOfGrade: Number,
    url: URL,
    type: String,
    notes: String,
});
exports.default = mongoose_1.model("Assignment", assignmentSchema);
//# sourceMappingURL=Assignment.js.map