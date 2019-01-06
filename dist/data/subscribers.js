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
function createOrSubscribe(discordId, phone, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const alreadyExists = yield Subscriber_1.default.findOneAndUpdate({ "discordId": discordId }, { $set: { subscribed: true } }).exec();
            if (alreadyExists) {
                return alreadyExists;
            }
            const subscriber = new Subscriber_1.default({
                discordId: discordId,
                subscribed: true,
                phone,
                options
            });
            const doc = yield subscriber.save();
            return doc;
        }
        catch (err) {
            console.log("Error in create/subscribe operation: " + err);
        }
    });
}
exports.createOrSubscribe = createOrSubscribe;
function unsubscribe(discordId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const documentUpdated = yield Subscriber_1.default.findOneAndUpdate({ "discordId": discordId }, { $set: { subscribed: false } }).exec();
            if (documentUpdated) {
                return documentUpdated;
            }
            else {
                throw "Subscriber does not exist";
            }
        }
        catch (err) {
            console.log("Error in unsubscribe operation: " + err);
        }
    });
}
exports.unsubscribe = unsubscribe;
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
    return __awaiter(this, void 0, void 0, function* () {
        return Subscriber_1.default.updateOne({ "discordId": discordId }, { $set: { options: { daysPrior, daysInterval, timeOfDay } } }).exec();
    });
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
function setTestState() {
    return __awaiter(this, void 0, void 0, function* () {
        Subscriber_1.default.deleteMany({ subscribed: true }, () => __awaiter(this, void 0, void 0, function* () {
            try {
                const subscriber = new Subscriber_1.default({
                    discordId: process.env.TEST_DISCORD_ID,
                    subscribed: true,
                    phone: process.env.TEST_PHONE,
                    options: {
                        daysPrior: 1,
                        daysInterval: 1,
                        timeOfDay: new Date().getHours()
                    }
                });
                yield subscriber.save();
            }
            catch (err) {
                console.log("Error in create operation: " + err);
            }
        }));
    });
}
exports.setTestState = setTestState;
//# sourceMappingURL=subscribers.js.map