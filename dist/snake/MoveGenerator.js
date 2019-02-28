"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const helpers_1 = require("../util/helpers");
const _ = __importStar(require("lodash"));
exports.MoveGenerator = class {
    constructor() {
        this.selfProximityWeight = 1;
        this.foodProximityWeight = 25;
        this.centreProximityWeight = 30;
        this.agressionWeight = 10;
        this.avoidanceWeight = 10;
        this.pathPromises = [];
        this.paths = [];
        this.foodPath = [];
        this.agressionPath = [];
        this.nonAvoidancePath = [];
        this.height = StateAnalyzer_1.StateAnalyzer.getBoardHeight();
        this.width = StateAnalyzer_1.StateAnalyzer.getBoardWidth();
        this.stepReferenceScalar = this.height + this.width;
        SnakeLogger_1.SnakeLogger.info("Constructing MoveGenerator - Generating all paths");
        const start = StateAnalyzer_1.StateAnalyzer.getMyPosition();
        const dodger = new TailDodger_1.TailDodger(start);
        this.startMs = new Date().getTime();
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const end = { x, y };
                if (!_.isEqual(end, StateAnalyzer_1.StateAnalyzer.getMyPosition())) {
                    const pathPromise = dodger.getShortestPath(end);
                    this.pathPromises.push(pathPromise);
                }
            }
        }
    }
    generateMove() {
        return __awaiter(this, void 0, void 0, function* () {
            SnakeLogger_1.SnakeLogger.info("Starting generateMove");
            const bestPath = yield this.bestPath();
            SnakeLogger_1.SnakeLogger.info("target xy: " + JSON.stringify(bestPath[bestPath.length - 1]));
            SnakeLogger_1.SnakeLogger.info("path projection: " + JSON.stringify(bestPath));
            if (typeof bestPath != "undefined") {
                return StateAnalyzer_1.StateAnalyzer.getMove(bestPath[0], bestPath[1]);
            }
            else {
                return StateAnalyzer_1.StateAnalyzer.safeMove();
            }
        });
    }
    bestPath() {
        return __awaiter(this, void 0, void 0, function* () {
            let bestIndex;
            let bestScore = 0;
            for (let i = 0; i < this.pathPromises.length; i++) {
                try {
                    const path = yield this.pathPromises[i];
                    SnakeLogger_1.SnakeLogger.info("Path " + JSON.stringify(path) + " has been acquired");
                    this.paths.push(path);
                }
                catch (e) {
                    const stack = new Error().stack;
                    SnakeLogger_1.SnakeLogger.error(e + " : " + stack);
                }
            }
            const endMs = new Date().getTime();
            SnakeLogger_1.SnakeLogger.info(this.paths.length + " paths have been generated in " + (endMs - this.startMs) + " milliseconds");
            this.foodPath = this.filterForFoodPath();
            this.agressionPath = this.filterForAgressionPath();
            this.nonAvoidancePath = this.filterForNonAvoidancePath();
            for (let i = 0; i < this.paths.length; i++) {
                const score = this.scorePath(this.paths[i]);
                if (score > bestScore) {
                    bestScore = score;
                    bestIndex = i;
                }
            }
            const bestPath = this.paths[bestIndex];
            SnakeLogger_1.SnakeLogger.info("Best path found to be " + JSON.stringify(bestPath));
            return bestPath;
        });
    }
    scorePath(path) {
        const endPoint = path[path.length - 1];
        const selfProximityFactor = 1 - (path.length / this.stepReferenceScalar);
        const selfProximityTerm = selfProximityFactor * this.selfProximityWeight;
        // The following compares the path to all of the food paths, and generates a factor
        // that is larger the more the path overlaps with any of the food paths
        let foodPathCommonality = 0;
        for (let j = 0; j < Math.min(this.foodPath.length, path.length); j++) {
            if (_.isEqual(path[j], this.foodPath[j]))
                foodPathCommonality++;
        }
        const foodProximityFactor = (foodPathCommonality / this.stepReferenceScalar);
        const foodProximityTerm = foodProximityFactor * this.foodProximityWeight * (1 + (StateAnalyzer_1.StateAnalyzer.getMyHunger()) / 33);
        SnakeLogger_1.SnakeLogger.info("foodProximityTerm is " + foodProximityTerm);
        let divideMeByLength = 0;
        for (let i = 0; i < path.length; i++) {
            divideMeByLength += StateAnalyzer_1.StateAnalyzer.getDistanceFromCenter(path[i]);
        }
        const averageDistanceFromCenter = divideMeByLength / path.length;
        const centerProximityFactor = 1 - (averageDistanceFromCenter / this.stepReferenceScalar);
        const centerProximityTerm = centerProximityFactor * this.centreProximityWeight;
        SnakeLogger_1.SnakeLogger.info("centerProximityTerm is " + centerProximityTerm);
        let agressionPathCommonality = 0;
        for (let j = 0; j < Math.min(this.agressionPath.length, path.length); j++) {
            if (_.isEqual(path[j], this.agressionPath[j]))
                agressionPathCommonality++;
        }
        const agressionFactor = (agressionPathCommonality / this.stepReferenceScalar);
        const agressionTerm = agressionFactor * this.agressionWeight;
        SnakeLogger_1.SnakeLogger.info("agressionTerm is " + agressionTerm);
        let nonAvoidancePathCommonality = 0;
        for (let j = 0; j < Math.min(this.nonAvoidancePath.length, path.length); j++) {
            if (_.isEqual(path[j], this.nonAvoidancePath[j]))
                nonAvoidancePathCommonality++;
        }
        const avoidanceFactor = 1 - (nonAvoidancePathCommonality / this.stepReferenceScalar);
        const avoidanceTerm = avoidanceFactor * this.avoidanceWeight;
        SnakeLogger_1.SnakeLogger.info("avoidanceTerm is " + avoidanceTerm);
        // Add a bias?
        const bias = 0;
        const summedScore = selfProximityTerm + foodProximityTerm + centerProximityTerm + agressionTerm + avoidanceTerm;
        SnakeLogger_1.SnakeLogger.info("summedScore for path to endPoint " + JSON.stringify(endPoint) + " is " + summedScore);
        return summedScore + bias;
    }
    filterForFoodPath() {
        SnakeLogger_1.SnakeLogger.info("Filtering food paths");
        const foodPoints = StateAnalyzer_1.StateAnalyzer.getFoodPoints(0);
        const foodPaths = this.paths.filter((path) => {
            const endPoint = path[path.length - 1];
            return helpers_1.getIndexOfValue(foodPoints, endPoint) > -1;
        });
        foodPaths.sort((a, b) => {
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
        return foodPaths[0];
    }
    filterForAgressionPath() {
        SnakeLogger_1.SnakeLogger.info("Filtering Agression paths");
        const smallerHeadPoints = StateAnalyzer_1.StateAnalyzer.getSmallerHeadPoints();
        const smallerHeadPaths = this.paths.filter((path) => {
            const endPoint = path[path.length - 1];
            return helpers_1.getIndexOfValue(smallerHeadPoints, endPoint) > -1;
        });
        smallerHeadPaths.sort((a, b) => {
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
        return smallerHeadPaths[0];
    }
    filterForNonAvoidancePath() {
        SnakeLogger_1.SnakeLogger.info("Filtering Agression paths");
        const largerHeadPoints = StateAnalyzer_1.StateAnalyzer.getLargerHeadPoints();
        const largerHeadPaths = this.paths.filter((path) => {
            const endPoint = path[path.length - 1];
            return helpers_1.getIndexOfValue(largerHeadPoints, endPoint) > -1;
        });
        largerHeadPaths.sort((a, b) => {
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
        return largerHeadPaths[0];
    }
};
//# sourceMappingURL=MoveGenerator.js.map