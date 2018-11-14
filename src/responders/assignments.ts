import { ObjectID } from "mongodb";
import { Document } from "mongoose";
import Assignment from "../models/assignment";

export const create = async function (name: string, dueDate: Date, percentOfGrade: number, url: string, type: string, note: string): Promise<Document> {
    try {

        const assignment = new Assignment({
            name,
            dueDate,
            url,
            note
        });

        const doc = await assignment.save();
        return doc;

    } catch (err) {
        console.log("Error in create operation: " + err);
    }

};

export const readAll = async function () {
    try {
        const allDocs = await Assignment.find();
        return allDocs;
    } catch (err) {
        console.log("Error in read operation: " + err);
    }
};