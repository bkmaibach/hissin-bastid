import { ObjectID } from "mongodb";
import { Document } from "mongoose";
import Assignment from "../models/Assignment";
import { IAssignment } from "../models/Assignment";

export const create = async function (course: string, name: string, dueDate: Date, url: string, note: string): Promise<IAssignment> {
    const assignment = new Assignment({
        course,
        name,
        dueDate,
        url,
        note
    });

    const doc = <IAssignment>await assignment.save();
    return doc;
};

export const readAll = async function (): Promise<Document[]> {
    try {
        const allDocs = Assignment.find({}).exec();
        return allDocs;
    } catch (err) {
        console.log("Error in read operation: " + err);
    }
};

export const readAllDueSoon = async function (howSoonInDays: number): Promise<Document[]> {
    try {
        const now = new Date();
        const dateConsideredSoon = new Date(new Date().setTime( now.getTime() + howSoonInDays * 86400000 ));
        const docs = Assignment.find({dueDate: {$gte: now, $lte: dateConsideredSoon}}).exec();
        return docs;
    } catch (err) {
        console.log("Error in read operation: " + err);
    }
};

export const readAllDue = async function (): Promise<Document[]> {
    try {
        const now = new Date();
        const docs = Assignment.find({dueDate: {$gte: now}}).exec();
        return docs;
    } catch (err) {
        console.log("Error in read operation: " + err);
    }
};

export async function setTestState(): Promise<void> {
Assignment.deleteMany({ name: /.*/ }, async () => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1);
        try {

            const assignment = new Assignment({
                course: "ITAS164",
                name: "TEST",
                dueDate,
                url: "https://stackoverflow.com",
                note: "TEST"
            });
            const doc = <IAssignment>await assignment.save();

        } catch (err) {
        console.log("Error in create operation: " + err);
        }
    });
}
