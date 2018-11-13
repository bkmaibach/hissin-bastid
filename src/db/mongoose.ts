import * as mongoose from "mongoose";
import { MONGODB_URI } from "../util/secrets";

(<any>mongoose).Promise = global.Promise;

mongoose.connect(MONGODB_URI);

export default mongoose;