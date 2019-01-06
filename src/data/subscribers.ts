import { ObjectID } from "mongodb";
import { Document } from "mongoose";
import Subscriber from "../models/Subscriber";
import { ISubscriber } from "../models/Subscriber";

export async function createOrSubscribe(discordId: string, phone?: string, options?: {daysPrior: number, daysInterval: number, timeOfDay: number}): Promise<ISubscriber> {
    try {
        const alreadyExists = <ISubscriber>await Subscriber.findOneAndUpdate({"discordId": discordId}, { $set: {subscribed: true }}).exec();

        if (alreadyExists) {
            return alreadyExists;
        }

        const subscriber = new Subscriber({
            discordId: discordId,
            subscribed: true,
            phone,
            options
        });

        const doc = <ISubscriber>await subscriber.save();
        return doc;

    } catch (err) {
        console.log("Error in create/subscribe operation: " + err);
    }
}

export async function unsubscribe(discordId: string): Promise<ISubscriber> {
    try {
        const documentUpdated = <ISubscriber>await Subscriber.findOneAndUpdate({"discordId": discordId}, { $set: {subscribed: false }}).exec();

        if (documentUpdated) {
            return documentUpdated;
        } else {
            throw "Subscriber does not exist";
        }

    } catch (err) {
        console.log("Error in unsubscribe operation: " + err);
    }
}

export function updateLastReminded(discordId: string, now: Date): Promise<number> {
    try {
        return Subscriber.updateOne({"discordId": discordId}, { $set: {lastReminded: now} }).exec();
    } catch (err) {
        console.log("Error in update operation: " + err);
    }
}

export async function updateOptions(discordId: string, daysPrior: number, daysInterval: number, timeOfDay: number): Promise<number> {
    return Subscriber.updateOne({"discordId": discordId}, { $set: {options: {daysPrior, daysInterval, timeOfDay} } }).exec();
}

export function readAllSubscribed(): Promise<Document[]> {
    try {
        const allDocs = Subscriber.find({subscribed: true}).exec();
        return allDocs;
    } catch (err) {
        console.log("Error in read operation: " + err);
    }
}

export async function setTestState(): Promise<void> {
    Subscriber.deleteMany({ subscribed: true }, async () => {
        try {

            const subscriber = new Subscriber({
                discordId: process.env.TEST_DISCORD_ID,
                subscribed: true,
                phone: process.env.TEST_PHONE,
                options: {
                    daysPrior: 1,
                    daysInterval: 1,
                    timeOfDay: new Date().getHours()
                }
            });

        await subscriber.save();

        } catch (err) {
        console.log("Error in create operation: " + err);
        }
    });
}
