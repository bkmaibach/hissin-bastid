import { StateAnalyzer } from "./StateAnalyzer";
import { request } from "http";
import * as data from "../data/data";

export const TargetGenerator = class {

    constructor() {

    }

    getSortedTargets () {
        const tailTip = StateAnalyzer.getMyTailTip();
        const targets = StateAnalyzer.getFoodPoints(0);
        targets.push(tailTip);
        return targets;
    }
};