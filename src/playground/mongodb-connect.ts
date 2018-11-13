import { MongoClient, ObjectID } from "mongodb";
import * as secrets from "../util/secrets";
import { mongo } from "mongoose";

// const url = "mongodb://localhost:27017";
const url = secrets.MONGODB_URI;
console.log(url);

const mongoInsert = async function () {
    try {
        const client = await MongoClient.connect(url);
        const db = client.db("ProfessorBot");
        const collection = db.collection("Assignments");

        const result = await collection.insertOne({
            dueDate: "November 25",
            percentOfGrade: 10,
            link: "www.4.com",
            type: "specific",
            notes: "this is a test 4"
        });
        console.log("result2: " + result);
        client.close();
    } catch (err) {
        console.log("Error in some operation: " + err);
    }

};

const mongoFind = async function () {
    try {
        const client = await MongoClient.connect(url);
        const db = client.db("ProfessorBot");
        const collection = db.collection("Assignments");

        const cursor = await collection.find();
        const docs = await cursor.toArray();
        const count = await cursor.count();
        console.log("All docs");
        console.log(docs);
        console.log("Count");
        console.log(count);

        const moreDocs = await collection.find({type: "specific"}).toArray();
        console.log("Specific docs");
        console.log(moreDocs);

        const newId = new ObjectID("5be88c564883c27dd1df46e8");
        const uniqueDoc = await collection.find({
            _id: newId
        }).toArray();
        console.log("Unique doc");
        console.log(uniqueDoc);
        client.close();
    } catch (err) {
        console.log("Error in some operation: " + err);
    }
};

mongoInsert();
mongoFind();

// Available update methods:
// findOneAndUpdate

// Available delete methods:
// deleteMany
// deleteOne
// findOneAndDelete



