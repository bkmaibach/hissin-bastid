import { StateAnalyzer } from "./StateAnalyzer";
import { request } from "http";
export const TargetGenerator = class {

    constructor() {

    }

    getSortedTargets () {
        const tailTip = StateAnalyzer.getMyTailTip();
        const targets = StateAnalyzer.getFoodPoints();
        targets.push(tailTip);
        return targets;
    }
};