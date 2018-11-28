"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const subscribers = __importStar(require("./data/subscribers"));
const assignments = __importStar(require("./data/assignments"));
const bot_1 = require("./bot");
const helpers_1 = require("./helpers");
// Initialization function to be started from server
exports.init = function () {
    // YELLOW! :D
    console.log("Background workers starting...");
    // Execute all the checks upon start
    gatherAllSubscribers();
    loop();
};
let interval;
if (process.env.NODE_ENV == "production") {
    interval = 15 * 60;
}
else {
    interval = 3;
}
const loop = () => {
    setInterval(() => {
        gatherAllSubscribers();
    }, 1000 * interval);
};
const gatherAllSubscribers = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const subscribed = yield subscribers.readAllSubscribed();
            subscribed.forEach((subscriberWrapper) => {
                const sub = subscriberWrapper.toObject();
                processReminder(sub);
            });
        }
        catch (err) {
            console.log("Error in gathering subscribers: " + err);
        }
    });
};
const processReminder = function (sub) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        const lastReminded = sub.lastReminded;
        const daysPrior = sub.options.daysPrior;
        const daysInterval = sub.options.daysInterval;
        let timeOfDay;
        if (process.env.NODE_ENV == "production") {
            timeOfDay = sub.options.timeOfDay;
        }
        else {
            timeOfDay = now.getHours();
        }
        // Determine how long it has been since the subscriber was last reminded
        const intervalHasElapsed = (now.valueOf() - lastReminded.valueOf()) > (daysInterval * 24 * 60 * 60 * 1000);
        if (intervalHasElapsed && now.getHours() == timeOfDay) {
            const dueSoon = yield assignments.readAllDueSoon(daysPrior);
            if (dueSoon.length > 0) {
                let message = "The following due/exam dates are fast approaching:";
                dueSoon.forEach((assignmentWrapper) => {
                    const assignment = assignmentWrapper.toObject();
                    message = message + "\n" + assignment.course + " - " + assignment.name + ": due " + assignment.dueDate.toDateString();
                });
                bot_1.sendDiscordMessage(sub.discordId, message);
                if (sub.phone)
                    helpers_1.sendTwilioSms(sub.phone, message);
                subscribers.updateLastReminded(sub.discordId, now);
            }
        }
    });
};
//# sourceMappingURL=workers.js.map