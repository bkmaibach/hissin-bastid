"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = __importStar(require("mongoose"));
const secrets_1 = require("../util/secrets");
mongoose.Promise = global.Promise;
mongoose.connect(secrets_1.MONGODB_URI);
exports.default = mongoose;
//# sourceMappingURL=mongoose.js.map