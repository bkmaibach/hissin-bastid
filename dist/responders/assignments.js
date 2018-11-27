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
}
Object.defineProperty(exports, "__esModule", { value: true });
const assignment_1 = __importDefault(require("../models/assignment"));
exports.create = function (name, dueDate, percentOfGrade, url, type, note) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const assignment = new assignment_1.default({
                name,
                dueDate,
                url,
                note
            });
            const doc = yield assignment.save();
            return doc;
        }
        catch (err) {
            console.log("Error in create operation: " + err);
        }
    });
};
exports.readAll = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const allDocs = yield assignment_1.default.find();
            return allDocs;
        }
        catch (err) {
            console.log("Error in read operation: " + err);
        }
    });
};
//# sourceMappingURL=assignments.js.map