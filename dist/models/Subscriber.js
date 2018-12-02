"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const optionSchema = new mongoose_1.Schema({
    daysPrior: {
        type: Number,
        default: 3,
        min: 0
    },
    daysInterval: {
        type: Number,
        default: 1,
        min: 1
    },
    timeOfDay: {
        // Number to denote hours past midnight the subscriber would like to be notified on appropriate days
        type: Number,
        default: 12,
        min: 0,
        max: 23
    }
});
const subscriberSchema = new mongoose_1.Schema({
    discordId: {
        type: String,
        required: true,
        unique: true
    },
    subscribed: {
        type: Boolean,
        required: true,
    },
    lastReminded: {
        type: Date,
        required: false,
        default: new Date(0)
    },
    phone: {
        type: String,
        required: false
    },
    options: {
        type: optionSchema,
        default: optionSchema
    }
});
exports.default = mongoose_1.model("Subscriber", subscriberSchema);
//# sourceMappingURL=Subscriber.js.map