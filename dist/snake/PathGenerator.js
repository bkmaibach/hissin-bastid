"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const StateAnalyzer_1 = require("./StateAnalyzer");
const TailDodger_1 = require("./TailDodger");
const _ = __importStar(require("lodash"));
exports.PathGenerator = class {
    constructor() {
    }
    getPrioritizedPaths() {
        const myPosition = StateAnalyzer_1.StateAnalyzer.getMyPosition();
        const myHunger = StateAnalyzer_1.StateAnalyzer.getMyHunger();
        const foodPoints = StateAnalyzer_1.StateAnalyzer.getFoodPoints(0);
        const smallerSnakeHeads = StateAnalyzer_1.StateAnalyzer.getSmallerHeadPoints();
        const tailTip = StateAnalyzer_1.StateAnalyzer.getMyTailTip();
        const dodger = new TailDodger_1.TailDodger(myPosition);
        const foodPaths = dodger.getShortestPaths(foodPoints);
        const agressionPaths = dodger.getShortestPaths(smallerSnakeHeads);
        let tailPath;
        if (!_.isEqual(tailTip, myPosition)) {
            tailPath = dodger.getShortestPath(tailTip);
        }
        else {
            tailPath = [];
        }
        let prioritizedPaths;
        if (myHunger < 50) {
            const primaryPaths = foodPaths.concat(agressionPaths);
            this.sortByLength(primaryPaths);
            const sortedPaths = primaryPaths.concat(tailPath);
            prioritizedPaths = this.deprioritizePaths(sortedPaths, (path) => {
                return StateAnalyzer_1.StateAnalyzer.isEdgePoint(path[path.length - 1]);
            });
        }
        else {
            const primaryPaths = foodPaths;
            this.sortByLength(primaryPaths);
            const secondaryPaths = agressionPaths;
            this.sortByLength(secondaryPaths);
            const sortedPaths = primaryPaths.concat(secondaryPaths).concat(tailPath);
            prioritizedPaths = this.deprioritizePaths(sortedPaths, (path) => {
                return StateAnalyzer_1.StateAnalyzer.isEdgePoint(path[path.length - 1])
                    && !StateAnalyzer_1.StateAnalyzer.isFoodPoint(path[path.length - 1]);
            });
        }
        return prioritizedPaths;
    }
    sortByLength(paths) {
        paths.sort((a, b) => {
            if (a.length < b.length) {
                return -1;
            }
            else if (a.length > b.length) {
                return 1;
            }
            else {
                return 0;
            }
        });
    }
    deprioritizePaths(paths, condition) {
        const deprioritizedPaths = [];
        for (let i = 0; i < paths.length; i++) {
            if (condition(paths[i])) {
                const deprioritizedPath = paths.splice(i, 1)[0]; // 0 is the item index, 1 is the count of items you want to remove.
                deprioritizedPaths.push(deprioritizedPath);
                i--;
            }
        }
        return paths.concat(deprioritizedPaths);
    }
};
//# sourceMappingURL=PathGenerator.js.map