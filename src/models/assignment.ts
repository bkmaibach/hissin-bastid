import { Schema, model }  from "mongoose";

const AssignmentSchema = new Schema( {
    course: {
        type: String,
        required: true,
        enum: ["ITAS155", "ITAS191", "ITAS167", "ITAS185"],
        trim: true
    },
    name: {
        type: String,
        required: true,
        minLength: 1,
        unique: true,
        trim: true
    },
    createdAt: Date,
    updatedAt: Date,
    dueDate: {
        type: Date,
        required: true
    },
    percentOfGrade: {
        type: Number
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["report", "exam"],
        required: true
    },
    note: {
        type: String
    }
});

export default model("Assignment", AssignmentSchema);