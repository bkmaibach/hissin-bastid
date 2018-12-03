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
const Subscriber_1 = __importDefault(require("../models/Subscriber"));
function create(id, phone, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const subscriber = new Subscriber_1.default({
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
}
exports.create = create;
function updateLastReminded(discordId, now) {
    try {
        return Subscriber_1.default.updateOne({ "discordId": discordId }, { $set: { lastReminded: now } }).exec();
    }
    catch (err) {
        console.log("Error in update operation: " + err);
    }
}
exports.updateLastReminded = updateLastReminded;
function updateOptions(discordId, daysPrior, daysInterval, timeOfDay) {
    try {
        return Subscriber_1.default.updateOne({ "discordId": discordId }, { $set: { options: { daysPrior, daysInterval, timeOfDay } } }).exec();
    }
    catch (err) {
        console.log("Error in update operation: " + err);
    }
}
exports.updateOptions = updateOptions;
function readAllSubscribed() {
    try {
        const allDocs = Subscriber_1.default.find({ subscribed: true }).exec();
        return allDocs;
    }
    catch (err) {
        console.log("Error in read operation: " + err);
    }
}
exports.readAllSubscribed = readAllSubscribed;
//# sourceMappingURL=subscribers.js.map