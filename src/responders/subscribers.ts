import { ObjectID } from "mongodb";
import { Document } from "mongoose";
import Subscriber from "../models/subscriber";

export const create = async function (id: string, phone?: string, options?: {daysPrior: number, daysInterval: number}): Promise<Document> {
    try {

        const subscriber = new Subscriber({
            discordId: id,
            subscribed: true,
            phone,
            options
        });

        const doc = await subscriber.save();
        return doc;

    } catch (err) {
        console.log("Error in create operation: " + err);
    }

};