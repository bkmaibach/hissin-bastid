"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StateAnalyzer_1 = require("./StateAnalyzer");
exports.TargetGenerator = class {
    constructor() {
    }
    getSortedTargets() {
        return StateAnalyzer_1.StateAnalyzer.getFoodPoints();
    }
};
module.exports = {
    TargetGenerator: exports.TargetGenerator
};
//# sourceMappingURL=TargetGenerator.js.map