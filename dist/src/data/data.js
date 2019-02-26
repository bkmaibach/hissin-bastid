"use strict";
/*
* Library for storing and editing data
*
*
*/
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
};
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
const path = __importStar(require("path"));
const promisified_1 = require("../util/promisified");
const helpers_1 = require("../util/helpers");
const util_1 = require("util");
// Base directory of the data folder
exports.baseDir = path.join(__dirname, "../logs");
exports.createFile = (dir, file, data) => __awaiter(this, void 0, void 0, function* () {
    util_1.debug("Creating file " + `${exports.baseDir}/${dir}/${file}.json`);
    const strData = JSON.stringify(data);
    const fd = yield promisified_1.open(`${exports.baseDir}/${dir}/${file}.json`, "wx");
    yield promisified_1.writeFile(fd, strData);
    return yield promisified_1.close(fd);
});
exports.readFile = function (dir, file) {
    return __awaiter(this, void 0, void 0, function* () {
        util_1.debug("Reading file " + `${exports.baseDir}/${dir}/${file}.json`);
        const userStr = yield exports.readFile(`${exports.baseDir}/${dir}/${file}.json`, "utf-8");
        return yield helpers_1.parseStringToObject(userStr);
    });
};
exports.updateFile = function (dir, file, data) {
    return __awaiter(this, void 0, void 0, function* () {
        util_1.debug("Updating file " + `${exports.baseDir}/${dir}/${file}.json`);
        const strData = JSON.stringify(data);
        const fd = yield promisified_1.open(`${exports.baseDir}/${dir}/${file}.json`, "r+");
        yield promisified_1.ftruncate(fd);
        yield promisified_1.writeFile(fd, strData);
        return yield promisified_1.close(fd);
    });
};
exports.deleteFile = function (dir, file) {
    return __awaiter(this, void 0, void 0, function* () {
        util_1.debug("Deleting file " + `${exports.baseDir}/${dir}/${file}.json`);
        return yield promisified_1.unlink(`${exports.baseDir}/${dir}/${file}.json`);
    });
};
// List all the items in a directory
exports.list = (dir) => __awaiter(this, void 0, void 0, function* () {
    util_1.debug("Listing directory " + dir);
    const data = yield promisified_1.readdir(exports.baseDir + " /" + dir);
    if (data.length > 0) {
        const trimmedFileNames = [];
        data.forEach((fileName) => {
            // Remove .json
            trimmedFileNames.push(fileName.replace(".json", " "));
        });
        return trimmedFileNames;
    }
});
//# sourceMappingURL=data.js.map