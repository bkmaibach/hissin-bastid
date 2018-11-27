import { Schema, model, Document }  from "mongoose";
import { ObjectId } from "mongodb";

export interface ISubscriber extends Document {
    discordId: string;
    subscribed: boolean;
    lastReminded: Date;
    phone: string;

    options: { daysPrior: number, daysInterval: number, timeOfDay: number };
}

const optionSchema = new Schema( {
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
} );

const subscriberSchema = new Schema( {
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



export default model("Subscriber", subscriberSchema);