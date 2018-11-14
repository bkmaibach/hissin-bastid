"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const optionSchema = new mongoose_1.Schema({
    daysPrior: {
        type: Number,
        default: 3,
    },
    daysInterval: {
        type: Number,
        default: 1
    }
});
const subscriberSchema = new mongoose_1.Schema({
    subscribed: {
        type: Boolean,
        required: true,
    },
    phone: {
        type: String,
        required: false
    },
    options: { optionSchema }
});
exports.default = mongoose_1.model("Subscriber", subscriberSchema);
//# sourceMappingURL=subscribers.js.map