import { IPoint, IGameState } from "../snake/types";
import * as _ from "lodash";

// Similar to array.indexOf but works on value not reference
export function getIndexOfValue(array: IPoint[], entry: IPoint) {
    for (let i = 0; i < array.length; i++) {
        if (_.isEqual(array[i], entry)) {
            return i;
        }
    }
    return -1;
}

export function shuffle(array: any[]) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
}

export function parseStringToObject(str: string) {
    try {
        return JSON.parse(str);
    } catch (err) {
        return {};
    }
}