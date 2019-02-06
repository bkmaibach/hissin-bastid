import { StateAnalyzer } from "./StateAnalyzer";
export const TargetGenerator = class {

    constructor() {

    }

    getSortedTargets () {
        const tailTip = StateAnalyzer.getMyTailTip();
        const food = StateAnalyzer.getFoodPoints();
        food.push(tailTip);
        return food;
    }
};