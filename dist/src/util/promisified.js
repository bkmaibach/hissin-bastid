"use strict";
// Promisified functions return promises instead of calling callbacks and can be used with async/await
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
const fs = __importStar(require("fs"));
const zlib = __importStar(require("zlib"));
const util = __importStar(require("util"));
exports.open = util.promisify(fs.open);
exports.append = util.promisify(fs.appendFile);
exports.close = util.promisify(fs.close);
exports.read = util.promisify(fs.readFile);
exports.ftruncate = util.promisify(fs.ftruncate);
exports.writeFile = util.promisify(fs.writeFile);
exports.unlink = util.promisify(fs.unlink);
exports.readdir = util.promisify(fs.readdir);
exports.gzip = util.promisify(zlib.gzip);
exports.unzip = util.promisify(zlib.unzip);
//# sourceMappingURL=promisified.js.map