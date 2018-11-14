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
const subscriber_1 = __importDefault(require("../models/subscriber"));
exports.create = function (id, phone, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const subscriber = new subscriber_1.default({
                discordId: id,
                subscribed: true,
                phone,
                options
            });
            const doc = yield subscriber.save();
            return doc;
        }
        catch (err) {
            console.log("Error in create operation: " + err);
        }
    });
};
//# sourceMappingURL=subscribers.js.map