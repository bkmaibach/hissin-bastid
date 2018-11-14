import { Schema, model, Document }  from "mongoose";
import { ObjectId } from "mongodb";

export interface ISubscriber extends Document {
    discordId: string;
    subscribed: boolean;
    phone: string;

    options: { daysPrior: number, daysInterval: number };
}

const optionSchema = new Schema( {
    daysPrior: {
        type: Number,
        default: 3,
    },
    daysInterval: {
        type: Number,
        default: 1
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
    phone: {
        type: String,
        required: false
    },
    options: { optionSchema }
});



export default model("Subscriber", subscriberSchema);