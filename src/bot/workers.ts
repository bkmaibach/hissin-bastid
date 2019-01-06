
import * as subscribers from "../data/subscribers";
import * as assignments from "../data/assignments";
import { ISubscriber } from "../models/Subscriber";
import { IAssignment } from "../models/Assignment";
import { sendDiscordMessage } from "./bot";
import { sendTwilioSms } from "../util/helpers";


// Initialization function to be started from server
export const init = async function (): Promise<void> {
    console.log("Background workers starting...");
    let interval: number;
    if (process.env.NODE_ENV == "production") {
        interval = 15 * 60 * 1000;
    } else {
        interval = 3 * 1000;
        await assignments.setTestState();
        await subscribers.setTestState();
    }

    // Execute all the checks upon start
    loop(interval);
};



const loop = (interval: number) => {
    setInterval( () => {
        gatherAllSubscribers();
    }, interval);
};

const gatherAllSubscribers = async function (): Promise<void> {
    try {
        const subscribed = await subscribers.readAllSubscribed();
        subscribed.forEach( (subscriberWrapper) => {
            const sub = <ISubscriber>subscriberWrapper.toObject();
            processReminder(sub);
        });
    } catch (err) {
        console.log("Error in gathering subscribers: " + err);
    }
};

const processReminder = async function (sub: ISubscriber): Promise<void> {

    const now = new Date();

    const lastReminded = sub.lastReminded;
    const daysPrior = sub.options.daysPrior;
    const daysInterval = sub.options.daysInterval;
    let timeOfDay: number;
    if (process.env.NODE_ENV == "production") {
        timeOfDay = sub.options.timeOfDay;
    } else {
        timeOfDay = now.getHours();
    }

    // Determine how long it has been since the subscriber was last reminded
    const intervalHasElapsed = (now.valueOf() - lastReminded.valueOf()) > (daysInterval * 24 * 60 * 60 * 1000);

    if (intervalHasElapsed && now.getHours() == timeOfDay) {
        const dueSoon = await assignments.readAllDueSoon(daysPrior);
        if (dueSoon.length > 0) {
            let message = "The following due/exam dates are fast approaching:";
            dueSoon.forEach((assignmentWrapper) => {
                const assignment = <IAssignment>assignmentWrapper.toObject();
                message = message + "\n" + assignment.course + " - " + assignment.name + ": due " + assignment.dueDate.toDateString()
                    + "\n" + assignment.url + "\n-------------------------\n";
            });
            sendDiscordMessage(sub.discordId, message);
            if (sub.phone) sendTwilioSms(sub.phone, message);
            subscribers.updateLastReminded(sub.discordId, now);
        }
    }
};