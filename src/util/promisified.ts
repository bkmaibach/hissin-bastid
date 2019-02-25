// Promisified functions return promises instead of calling callbacks and can be used with async/await

// Dependencies
import * as fs from "fs";
import * as zlib from "zlib";
import * as util from "util";


export const open = util.promisify(fs.open);
export const append = util.promisify(fs.appendFile);
export const close = util.promisify(fs.close);
export const read = util.promisify(fs.readFile);
export const ftruncate = util.promisify(fs.ftruncate);
export const writeFile = util.promisify(fs.writeFile);
export const unlink = util.promisify(fs.unlink);
export const readdir = util.promisify(fs.readdir);

export const gzip = util.promisify(zlib.gzip);
export const unzip = util.promisify(zlib.unzip);
