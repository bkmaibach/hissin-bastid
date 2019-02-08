import { StateAnalyzer } from "./StateAnalyzer";
import { request } from "http";
export const TargetGenerator = class {

    constructor() {

    }

    getSortedTargets () {
        const tailTip = StateAnalyzer.getMyTailTip();
        const food = StateAnalyzer.getFoodPoints();
        // If there is no food on board then run following code

        if (!StateAnalyzer.isThereFood()) {
            console.log("There is no food, returning [ " + tailTip + "]");
            return [tailTip];
        }
        return food;
    }
};