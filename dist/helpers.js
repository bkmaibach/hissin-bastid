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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const querystring = __importStar(require("querystring"));
const https = __importStar(require("https"));
const secrets_1 = require("./util/secrets");
const secrets_2 = require("./util/secrets");
const secrets_3 = require("./util/secrets");
exports.getJoke = () => __awaiter(this, void 0, void 0, function* () {
    const config = {
        headers: {
            Accept: "application/json",
        }
    };
    try {
        const response = yield axios_1.default.get("https://icanhazdadjoke.com", config);
        return response.data.joke;
    }
    catch (error) {
        console.error(error);
    }
});
exports.sendTwilioSms = (phone, message) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        if (phone && message) {
            // Configure the request payload
            const payload = {
                "From": secrets_1.TWILIO_FROM_PHONE,
                "To": "+1" + phone,
                "Body": message
            };
            // Configure the request details
            const stringPayload = querystring.stringify(payload);
            const requestDetails = {
                "protocol": "https:",
                "hostname": "api.twilio.com",
                "method": "POST",
                "path": "/2010-04-01/Accounts/" + secrets_2.TWILIO_ACCOUNT_SID + "/Messages.json",
                "auth": secrets_2.TWILIO_ACCOUNT_SID + ":" + secrets_3.TWILIO_AUTH_TOKEN,
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": Buffer.byteLength(stringPayload),
                }
            };
            // Instantiate a request object
            const req = https.request(requestDetails, (res) => {
                // Grab the status of the sent request
                const status = res.statusCode;
                // @TODO - REMOVE ME
                let buffer = "";
                res.on("data", (data) => {
                    buffer += data;
                    console.log(buffer);
                });
                // Return success if the request went through
                if (status >= 200 && status < 300) {
                    resolve();
                }
                else {
                    reject("Twilio rejected the request");
                    console.log(status);
                }
            });
            // Bind to the error event so it doesn"t get thrown
            req.on("error", (error) => {
                reject(error);
            });
            // Add the payload
            req.write(stringPayload);
            // End the request
            req.end();
        }
        else {
            reject("Given parameters were missing or invalid");
        }
    });
});
//# sourceMappingURL=helpers.js.map