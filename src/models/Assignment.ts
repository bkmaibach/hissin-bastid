import { Schema, model, Document }  from "mongoose";

export interface IAssignment extends Document {
    course: string;
    name: string;
    // createdAt: Date;
    // updatedAt: Date;
    dueDate: Date;
    url: string;
    note: string;
}

const assignmentSchema = new Schema( {
    course: {
        type: String,
        required: true,
        enum: ["ITAS175", "ITAS181", "ITAS164", "ITAS186"],
        trim: true
    },
    name: {
        type: String,
        required: true,
        minLength: 1,
        unique: true,
        trim: true
    },
    // updatedAt: Date,
    dueDate: {
        type: Date,
        required: true
    },
    url: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    note: {
        type: String
    }
});

export default model("Assignment", assignmentSchema);