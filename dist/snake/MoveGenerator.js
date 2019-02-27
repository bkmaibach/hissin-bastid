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
const helpers_1 = require("../util/helpers");
const _ = __importStar(require("lodash"));
exports.MoveGenerator = class {
    constructor() {
        this.selfProximityWeight = 10;
        this.foodProximityWeight = 25;
        this.centreProximityWeight = 10;
        this.agressionWeight = 15;
        this.avoidanceWeight = 10;
        this.paths = [];
        this.foodPaths = [];
        this.agressionPaths = [];
        this.nonAvoidancePaths = [];
        this.height = StateAnalyzer_1.StateAnalyzer.getBoardHeight();
        this.width = StateAnalyzer_1.StateAnalyzer.getBoardWidth();
        this.stepReferenceScalar = this.height + this.width;
        SnakeLogger_1.SnakeLogger.info("Constructing MoveGenerator");
        this.paths = this.generatePaths();
        this.foodPaths = this.generateFoodPaths();
        this.agressionPaths = this.generateAgressionPaths();
        this.nonAvoidancePaths = this.generateNonAvoidancePaths();
    }
    generateMove() {
        SnakeLogger_1.SnakeLogger.info("Starting generateMove");
        const bestPath = this.bestPath();
        if (typeof bestPath != "undefined") {
            return StateAnalyzer_1.StateAnalyzer.getMove(bestPath[0], bestPath[1]);
        }
        else {
            return StateAnalyzer_1.StateAnalyzer.safeMove();
        }
    }
    generatePaths() {
        SnakeLogger_1.SnakeLogger.info("Generating all paths");
        const start = StateAnalyzer_1.StateAnalyzer.getMyPosition();
        const dodger = new TailDodger_1.TailDodger(start);
        const paths = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const end = { x, y };
                if (!_.isEqual(end, StateAnalyzer_1.StateAnalyzer.getMyPosition())) {
                    const path = dodger.getShortestPath(end);
                    if (typeof path != "undefined")
                        paths.push(path);
                }
            }
        }
        return paths;
    }
    generateFoodPaths() {
        SnakeLogger_1.SnakeLogger.info("Filtering food paths");
        const foodPoints = StateAnalyzer_1.StateAnalyzer.getFoodPoints(0);
        const foodPaths = this.paths.filter((path) => {
            const endPoint = path[path.length - 1];
            return helpers_1.getIndexOfValue(foodPoints, endPoint) > -1;
        });
        return foodPaths;
    }
    generateAgressionPaths() {
        SnakeLogger_1.SnakeLogger.info("Filtering Agression paths");
        const smallerHeadPoints = StateAnalyzer_1.StateAnalyzer.getSmallerHeadPoints();
        const smallerHeadPaths = this.paths.filter((path) => {
            const endPoint = path[path.length - 1];
            return helpers_1.getIndexOfValue(smallerHeadPoints, endPoint) > -1;
        });
        return smallerHeadPaths;
    }
    generateNonAvoidancePaths() {
        SnakeLogger_1.SnakeLogger.info("Filtering Agression paths");
        const largerHeadPoints = StateAnalyzer_1.StateAnalyzer.getLargerHeadPoints();
        const largerHeadPaths = this.paths.filter((path) => {
            const endPoint = path[path.length - 1];
            return helpers_1.getIndexOfValue(largerHeadPoints, endPoint) > -1;
        });
        return largerHeadPaths;
    }
    bestPath() {
        let bestIndex;
        let bestScore = 0;
        for (let i = 0; i < this.paths.length; i++) {
            SnakeLogger_1.SnakeLogger.info("Scoring path " + i + " of " + this.paths.length);
            const score = this.scorePath(this.paths[i]);
            if (score > bestScore) {
                bestScore = score;
                bestIndex = i;
            }
        }
        return this.paths[bestIndex];
    }
    scorePath(path) {
        const selfProximityFactor = 1 - (path.length / this.stepReferenceScalar);
        const selfProximityTerm = selfProximityFactor * this.selfProximityWeight;
        // The following compares the path to all of the food paths, and generates a factor
        // that is larger the more the path overlaps with any of the food paths
        let foodPathCommonality = 0;
        for (let i = 0; i < this.foodPaths.length; i++) {
            const smallerLength = Math.min(this.foodPaths.length, path.length);
            for (let j = 0; j < smallerLength; j++) {
                if (_.isEqual(path[j], this.foodPaths[i][j]))
                    foodPathCommonality++;
            }
        }
        const foodProximityFactor = (foodPathCommonality / this.stepReferenceScalar);
        const foodProximityTerm = foodProximityFactor * this.foodProximityWeight * (1 + (StateAnalyzer_1.StateAnalyzer.getMyHunger()) / 50);
        let divideMeByLength = 0;
        for (let i = 0; i < path.length; i++) {
            divideMeByLength += StateAnalyzer_1.StateAnalyzer.getDistanceFromCenter(path[i]);
        }
        const averageDistanceFromCenter = divideMeByLength / path.length;
        const centerProximityFactor = 1 - (averageDistanceFromCenter / this.stepReferenceScalar);
        const centerProximityTerm = centerProximityFactor * this.centreProximityWeight;
        let agressionPathCommonality = 0;
        for (let i = 0; i < this.agressionPaths.length; i++) {
            const smallerLength = Math.min(this.agressionPaths.length, path.length);
            for (let j = 0; j < smallerLength; j++) {
                if (_.isEqual(path[j], this.agressionPaths[i][j]))
                    agressionPathCommonality++;
            }
        }
        const agressionFactor = (agressionPathCommonality / this.stepReferenceScalar);
        const agressionTerm = agressionFactor * this.agressionWeight;
        let nonAvoidancePathCommonality = 0;
        for (let i = 0; i < this.nonAvoidancePaths.length; i++) {
            const smallerLength = Math.min(this.nonAvoidancePaths.length, path.length);
            for (let j = 0; j < smallerLength; j++) {
                if (_.isEqual(path[j], this.nonAvoidancePaths[i][j]))
                    nonAvoidancePathCommonality++;
            }
        }
        const avoidanceFactor = 1 - (nonAvoidancePathCommonality / this.stepReferenceScalar);
        const avoidanceTerm = avoidanceFactor * this.avoidanceWeight;
        // Add a bias?
        const bias = 0;
        return selfProximityTerm + foodProximityTerm + centerProximityTerm + agressionTerm + avoidanceTerm + bias;
    }
};
//# sourceMappingURL=MoveGenerator.js.map