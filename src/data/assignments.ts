import { ObjectID } from "mongodb";
import { Document } from "mongoose";
import Assignment from "../models/assignment";
import { IAssignment } from "../models/assignment";

export const create = async function (name: string, dueDate: Date, percentOfGrade: number, url: string, type: string, note: string): Promise<IAssignment> {
    try {

        const assignment = new Assignment({
            name,
            dueDate,
            url,
            note
        });

        const doc = <IAssignment>await assignment.save();
        return doc;

    } catch (err) {
        console.log("Error in create operation: " + err);
    }

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