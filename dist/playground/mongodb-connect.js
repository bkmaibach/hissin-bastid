"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const secrets = __importStar(require("../util/secrets"));
// const url = "mongodb://localhost:27017";
const url = secrets.MONGODB_URI;
console.log(url);
const mongoInsert = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = yield mongodb_1.MongoClient.connect(url);
            const db = client.db("ProfessorBot");
            const collection = db.collection("Assignments");
            const result = yield collection.insertOne({
                dueDate: "November 25",
                percentOfGrade: 10,
                link: "www.4.com",
                type: "specific",
                notes: "this is a test 4"
            });
            console.log("result2: " + result);
            client.close();
        }
        catch (err) {
            console.log("Error in some operation: " + err);
        }
    });
};
const mongoFind = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = yield mongodb_1.MongoClient.connect(url);
            const db = client.db("ProfessorBot");
            const collection = db.collection("Assignments");
            const cursor = yield collection.find();
            const docs = yield cursor.toArray();
            const count = yield cursor.count();
            console.log("All docs");
            console.log(docs);
            console.log("Count");
            console.log(count);
            const moreDocs = yield collection.find({ type: "specific" }).toArray();
            console.log("Specific docs");
            console.log(moreDocs);
            const newId = new mongodb_1.ObjectID("5be88c564883c27dd1df46e8");
            const uniqueDoc = yield collection.find({
                _id: newId
            }).toArray();
            console.log("Unique doc");
            console.log(uniqueDoc);
            client.close();
        }
        catch (err) {
            console.log("Error in some operation: " + err);
        }
    });
};
mongoInsert();
mongoFind();
// Available update methods:
// findOneAndUpdate
// Available delete methods:
// deleteMany
// deleteOne
// findOneAndDelete
//# sourceMappingURL=mongodb-connect.js.map