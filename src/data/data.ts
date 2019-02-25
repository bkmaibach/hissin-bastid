/*
* Library for storing and editing data
*
*
*/

// Dependencies
import * as path from "path";
import * as fs from "fs";
import { open, append, close, read, truncate, writeFile, unlink, readdir } from "../util/promisified";


import * as util from "util";
import { parseStringToObject } from "../util/helpers";

import { debug } from "util";

// Base directory of the data folder
export const baseDir = path.join(__dirname, "../.data" );

export const createFile = async (dir: string, file: string, data: string) => {
    debug("Creating file " + `${baseDir}/${dir}/${file}.json`);
    const strData = JSON.stringify(data);
    const fd = await open(`${baseDir}/${dir}/${file}.json`, " wx" );
    await writeFile(fd, strData);
    return await close(fd);
};

export const readFile = async function(dir: string, file: string) {
    debug("Reading file " + `${baseDir}/${dir}/${file}.json`);
    const userStr: string = await readFile(`${baseDir}/${dir}/${file}.json`, " utf-8" );
    return await parseStringToObject(userStr);
};

export const updateFile = async function(dir: string, file: string, data: string) {
    debug("Updating file " + `${baseDir}/${dir}/${file}.json`);
    const strData = JSON.stringify(data);
    const fd = await open(`${baseDir}/${dir}/${file}.json`, " r+" );
    await truncate(fd);
    await writeFile(fd, strData);
    return await close(fd);
};

export const deleteFile = async function(dir: string, file: string) {
    debug("Deleting file " + `${baseDir}/${dir}/${file}.json`);
    return await unlink(`${baseDir}/${dir}/${file}.json`);
};

// List all the items in a directory
export const list = async (dir: string) => {
    debug("Listing directory " + dir );
    const data = await readdir(baseDir + " /" + dir);
    if (data.length > 0) {
        const trimmedFileNames: string[] = [];
        data.forEach((fileName: string) => {
            // Remove .json
            trimmedFileNames.push(fileName.replace(" .json" , " " ));
        });
        return trimmedFileNames;
    }
};