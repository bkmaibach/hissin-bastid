"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StateAnalyzer_1 = require("./StateAnalyzer");
exports.TargetGenerator = class {
    constructor() {
    }
    getSortedTargets() {
        const tailTip = StateAnalyzer_1.StateAnalyzer.getMyTailTip();
        const food = StateAnalyzer_1.StateAnalyzer.getFoodPoints();
        // If there is no food on board then run following code
        if (!StateAnalyzer_1.StateAnalyzer.isThereFood()) {
            console.log("There is no food, returning [ " + tailTip + "]");
            return [tailTip];
        }
        return food;
    }
};
//# sourceMappingURL=TargetGenerator.js.map