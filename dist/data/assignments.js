"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Assignment_1 = __importDefault(require("../models/Assignment"));
exports.create = function (course, name, dueDate, url, note) {
    return __awaiter(this, void 0, void 0, function* () {
        const assignment = new Assignment_1.default({
            course,
            name,
            dueDate,
            url,
            note
        });
        const doc = yield assignment.save();
        return doc;
    });
};
exports.readAll = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const allDocs = Assignment_1.default.find({}).exec();
            return allDocs;
        }
        catch (err) {
            console.log("Error in read operation: " + err);
        }
    });
};
exports.readAllDueSoon = function (howSoonInDays) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const now = new Date();
            const dateConsideredSoon = new Date(new Date().setTime(now.getTime() + howSoonInDays * 86400000));
            const docs = Assignment_1.default.find({ dueDate: { $gte: now, $lte: dateConsideredSoon } }).exec();
            return docs;
        }
        catch (err) {
            console.log("Error in read operation: " + err);
        }
    });
};
exports.readAllDue = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const now = new Date();
            const docs = Assignment_1.default.find({ dueDate: { $gte: now } }).exec();
            return docs;
        }
        catch (err) {
            console.log("Error in read operation: " + err);
        }
    });
};
function setTestState() {
    return __awaiter(this, void 0, void 0, function* () {
        Assignment_1.default.deleteMany({ name: /.*/ }, () => __awaiter(this, void 0, void 0, function* () {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 1);
            try {
                const assignment = new Assignment_1.default({
                    course: "ITAS164",
                    name: "TEST",
                    dueDate,
                    url: "https://stackoverflow.com",
                    note: "TEST"
                });
                const doc = yield assignment.save();
            }
            catch (err) {
                console.log("Error in create operation: " + err);
            }
        }));
    });
}
exports.setTestState = setTestState;
//# sourceMappingURL=assignments.js.map