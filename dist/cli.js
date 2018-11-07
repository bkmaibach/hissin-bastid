"use strict";
/*
    CLI related tasks
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const debug = util_1.default.debuglog("cli");
const events_1 = __importDefault(require("events"));
class CliEvents extends events_1.default {
}
const e = new CliEvents();
// let cli: object;
// let cli.init = function () {
// };
//# sourceMappingURL=cli.js.map