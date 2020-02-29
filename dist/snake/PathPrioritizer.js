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
const SnakeLogger_1 = require("../util/SnakeLogger");
const TailDodger_1 = require("./TailDodger");
const _ = __importStar(require("lodash"));
exports.PathPrioritizer = class {
    constructor() {
    }
    getPrioritizedPaths() {
        const myPosition = StateAnalyzer_1.StateAnalyzer.getMyPosition();
        const myHunger = StateAnalyzer_1.StateAnalyzer.getMyHunger();
        const foodPoints = StateAnalyzer_1.StateAnalyzer.getFoodPoints(0);
        const smallerSnakeHeads = StateAnalyzer_1.StateAnalyzer.getSmallerHeadPoints();
        const tailTip = StateAnalyzer_1.StateAnalyzer.getMyTailTip();
        const startTime = new Date().getTime();
        const dodger = new TailDodger_1.TailDodger(myPosition);
        const foodPaths = dodger.getShortestPaths(foodPoints);
        const agressionPaths = dodger.getShortestPaths(smallerSnakeHeads);
        const turn = StateAnalyzer_1.StateAnalyzer.getTurnNumber();
        const endTime = new Date().getTime();
        let tailPaths = [];
        if (!_.isEqual(tailTip, myPosition) && turn >= 2) {
            tailPaths = [dodger.getShortestPath(tailTip)];
        }
        SnakeLogger_1.SnakeLogger.info(foodPaths.length + agressionPaths.length + tailPaths.length + " paths found in " + (endTime - startTime) + " milliseconds");
        let prioritizedPaths;
        if (myHunger < 40) {
            const primaryPaths = foodPaths.concat(agressionPaths);
            this.sortByLength(primaryPaths);
            const sortedPaths = primaryPaths.concat(tailPaths);
            if (sortedPaths.length === 0) {
                return sortedPaths;
            }
            SnakeLogger_1.SnakeLogger.info("foodPaths is " + JSON.stringify(foodPaths));
            SnakeLogger_1.SnakeLogger.info("agressionPaths is " + JSON.stringify(agressionPaths));
            SnakeLogger_1.SnakeLogger.info("primaryPaths is " + JSON.stringify(primaryPaths));
            SnakeLogger_1.SnakeLogger.info("tailPaths is " + JSON.stringify(tailPaths));
            prioritizedPaths = this.deprioritizePaths(sortedPaths, (path) => {
                const endPoint = path[path.length - 1];
                return (StateAnalyzer_1.StateAnalyzer.isEdgePoint(endPoint)
                    && !_.isEqual(endPoint, tailTip))
                    || (StateAnalyzer_1.StateAnalyzer.howSurrounded(endPoint) > 3 && StateAnalyzer_1.StateAnalyzer.isFoodPoint(endPoint));
            });
            SnakeLogger_1.SnakeLogger.info("prioritizedPaths is " + JSON.stringify(prioritizedPaths));
        }
        else {
            const primaryPaths = foodPaths;
            this.sortByLength(primaryPaths);
            const secondaryPaths = agressionPaths;
            this.sortByLength(secondaryPaths);
            const sortedPaths = primaryPaths.concat(secondaryPaths).concat(tailPaths);
            if (sortedPaths.length === 0) {
                return sortedPaths;
            }
            prioritizedPaths = this.deprioritizePaths(sortedPaths, (path) => {
                const endPoint = path[path.length - 1];
                return (StateAnalyzer_1.StateAnalyzer.isEdgePoint(endPoint)
                    && !StateAnalyzer_1.StateAnalyzer.isFoodPoint(endPoint)
                    && !_.isEqual(endPoint, tailTip))
                    || (StateAnalyzer_1.StateAnalyzer.howSurrounded(endPoint) > 4 && StateAnalyzer_1.StateAnalyzer.isFoodPoint(endPoint));
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
        let i = 0;
        while (typeof paths[i] != "undefined") {
            if (condition(paths[i])) {
                const deprioritizedPath = paths.splice(i, 1)[0]; // 0 is the item index, 1 is the count of items you want to remove.
                deprioritizedPaths.push(deprioritizedPath);
            }
            else {
                i++;
            }
        }
        return paths.concat(deprioritizedPaths);
    }
};
//# sourceMappingURL=PathPrioritizer.js.map