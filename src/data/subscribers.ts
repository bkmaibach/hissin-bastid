import { ObjectID } from "mongodb";
import { Document } from "mongoose";
import Subscriber from "../models/subscriber";
import { ISubscriber } from "../models/subscriber";

export async function create(id: string, phone?: string, options?: {daysPrior: number, daysInterval: number, timeOfDay: number}): Promise<ISubscriber> {
    try {

        const subscriber = new Subscriber({
            discordId: id,
            subscribed: true,
            phone,
            options
        });

        const doc = <ISubscriber>await subscriber.save();
        return doc;

    } catch (err) {
        console.log("Error in create operation: " + err);
    }
}

export function updateLastReminded(discordId: string, now: Date): Promise<number> {
    try {
        return Subscriber.updateOne({"discordId": discordId}, { $set: {lastReminded: now} }).exec();
    } catch (err) {
        console.log("Error in update operation: " + err);
    }
}

export function updateOptions(discordId: string, daysPrior: number, daysInterval: number, timeOfDay: number): Promise<number> {
    try {
        return Subscriber.updateOne({"discordId": discordId}, { $set: {options: {daysPrior, daysInterval, timeOfDay} } }).exec();
    } catch (err) {
        console.log("Error in update operation: " + err);
    }
}

export function readAllSubscribed(): Promise<Document[]> {
    try {
        const allDocs = Subscriber.find({subscribed: true}).exec();
        return allDocs;
    } catch (err) {
        console.log("Error in read operation: " + err);
    }
}
