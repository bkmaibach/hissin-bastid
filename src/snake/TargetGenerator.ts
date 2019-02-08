import { StateAnalyzer } from "./StateAnalyzer";
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