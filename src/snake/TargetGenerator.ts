import { StateAnalyzer } from "./StateAnalyzer";
export const TargetGenerator = class {

    constructor() {

    }

    getSortedTargets () {
        return StateAnalyzer.getFoodPoints();
    }
};

module.exports = {
    TargetGenerator
 };