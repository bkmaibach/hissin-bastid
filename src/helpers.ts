import axios from "axios";
import * as crypto from "crypto";
import * as querystring from "querystring";
import * as https from "https";
import { TWILIO_FROM_PHONE } from "./util/secrets";
import { TWILIO_ACCOUNT_SID } from "./util/secrets";
import { TWILIO_AUTH_TOKEN } from "./util/secrets";

export const getJoke = async () => {
    const config = {
        headers: {
            Accept: "application/json",
        }
    };

    try {
        const response = await axios.get("https://icanhazdadjoke.com", config);
        return response.data.joke;
    } catch (error) {
        console.error(error);
    }
};

export const sendTwilioSms = async (phone: string, message: string) => {
    return new Promise( (resolve, reject) => {

        if (phone && message) {
            // Configure the request payload
            const payload = {
                "From" : TWILIO_FROM_PHONE,
                "To" : "+1" + phone,
                "Body": message
            };
            // Configure the request details
            const stringPayload = querystring.stringify(payload);
            const requestDetails = {
                "protocol": "https:",
                "hostname" : "api.twilio.com",
                "method" : "POST",
                "path" : "/2010-04-01/Accounts/" + TWILIO_ACCOUNT_SID + "/Messages.json",
                "auth" : TWILIO_ACCOUNT_SID + ":" + TWILIO_AUTH_TOKEN,
                "headers": {
                    "Content-Type" : "application/x-www-form-urlencoded",
                    "Content-Length" : Buffer.byteLength(stringPayload),
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
                } else {
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

        } else {
            reject("Given parameters were missing or invalid");
        }
    });
};