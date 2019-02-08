"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StateAnalyzer_1 = require("./StateAnalyzer");
exports.TargetGenerator = class {
    constructor() {
    }
    getSortedTargets() {
        const tailTip = StateAnalyzer_1.StateAnalyzer.getMyTailTip();
        const targets = StateAnalyzer_1.StateAnalyzer.getFoodPoints();
        targets.push(tailTip);
        return targets;
    }
};
//# sourceMappingURL=TargetGenerator.js.map