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
exports.MoveGenerator = class {
    constructor() {
        this.selfProximityWeight = 5;
        this.foodProximityWeight = 35;
        this.centreProximityWeight = 35;
        this.agressionWeight = 25;
        this.avoidanceWeight = 20;
        // pathPromises: Promise<IPoint[]>[] = [];
        this.scoredPaths = [];
        this.foodPaths = [];
        this.agressionPaths = [];
        this.suicidePaths = [];
        this.dodger = new TailDodger_1.TailDodger(StateAnalyzer_1.StateAnalyzer.getMyPosition());
        this.height = StateAnalyzer_1.StateAnalyzer.getBoardHeight();
        this.width = StateAnalyzer_1.StateAnalyzer.getBoardWidth();
        this.stepReferenceScalar = this.height + this.width;
        this.pathsScored = 0;
        ////        SnakeLogger.info("Constructing MoveGenerator");
        this.currentBestScoredPath = { path: [{ x: 0, y: 0 }], score: 0 };
        this.active = true;
    }
    commencePathScoring() {
        ////        SnakeLogger.info("Commencing path scoring");
        const startMs = new Date().getTime();
        const foodPoints = StateAnalyzer_1.StateAnalyzer.getFoodPoints(0);
        const smallerHeadPoints = StateAnalyzer_1.StateAnalyzer.getSmallerHeadPoints();
        const largerHeadPoints = StateAnalyzer_1.StateAnalyzer.getLargerHeadPoints();
        foodPoints.forEach((point) => {
            try {
                this.foodPaths.push(this.dodger.getShortestPath(point));
            }
            catch (e) {
                ////                SnakeLogger.error(e);
            }
        });
        smallerHeadPoints.forEach((point) => {
            try {
                this.agressionPaths.push(this.dodger.getShortestPath(point));
            }
            catch (e) {
                ////                SnakeLogger.error(e);
            }
        });
        largerHeadPoints.forEach((point) => {
            try {
                this.suicidePaths.push(this.dodger.getShortestPath(point));
            }
            catch (e) {
                ////                SnakeLogger.error(e);
            }
        });
        const endInitMs = new Date().getTime();
        ////        SnakeLogger.info("Init complete after " + (endInitMs - startMs) + " ms");
        this.spiralScore();
    }
    spiralScore() {
        // This section will begin parallelized threads, assigning argument points in a pattern spiraling out from the snakes position
        // See https://stackoverflow.com/questions/398299/looping-in-a-spiral
        const myPosition = StateAnalyzer_1.StateAnalyzer.getMyPosition();
        const width = StateAnalyzer_1.StateAnalyzer.getBoardWidth();
        const height = StateAnalyzer_1.StateAnalyzer.getBoardHeight();
        const X = width * 2;
        const Y = height * 2;
        let x = 0, y = 0;
        let dx, dy;
        x = y = dx = 0;
        dy = -1;
        let t = Math.max(X, Y);
        const maxI = t * t;
        for (let i = 0; i < maxI; i++) {
            if ((-X / 2 <= x) && (x <= X / 2) && (-Y / 2 <= y) && (y <= Y / 2)) {
                const point = { x: myPosition.x + x, y: myPosition.y + y };
                if (StateAnalyzer_1.StateAnalyzer.isOnBoard(point) && !_.isEqual(point, myPosition) && this.active) {
                    const startMs = new Date().getTime();
                    this.generateScoredPath(point).then((result) => {
                        const endMs = new Date().getTime();
                        ////                        SnakeLogger.debug("Score generation then block reached (" + (endMs - startMs) + " ms)");
                    }).catch((e) => {
                        ////                        SnakeLogger.error(e.message);
                    });
                }
            }
            if ((x == y) || ((x < 0) && (x == -y)) || ((x > 0) && (x == 1 - y))) {
                t = dx;
                dx = -dy;
                dy = t;
            }
            x += dx;
            y += dy;
        }
    }
    getMove() {
        this.active = false;
        let move;
        if (this.currentBestScoredPath.score != 0) {
            const path = this.currentBestScoredPath.path;
            ////            SnakeLogger.info("Chosen path projection: " + JSON.stringify(path));
            move = StateAnalyzer_1.StateAnalyzer.getMove(path[0], path[1]);
        }
        else {
            move = StateAnalyzer_1.StateAnalyzer.safeMove();
        }
        return move;
    }
    generateScoredPath(endPoint) {
        return new Promise((resolve, reject) => {
            ////            SnakeLogger.info("Scoring path to point " + JSON.stringify(endPoint));
            const startMs = new Date().getTime();
            let path;
            try {
                path = this.dodger.getShortestPath(endPoint);
            }
            catch (e) {
                reject(e);
            }
            const selfProximityFactor = 1 - (path.length / this.stepReferenceScalar);
            const selfProximityTerm = selfProximityFactor * this.selfProximityWeight;
            // The following compares the path to all of the food paths, and generates a factor
            // that is larger the more the path overlaps with any of the food paths
            let foodPathCommonality = 0;
            this.foodPaths.forEach((foodPath) => {
                for (let j = 0; j < Math.min(foodPath.length, path.length); j++) {
                    if (_.isEqual(path[j], foodPath[j]))
                        foodPathCommonality++;
                }
            });
            const foodProximityFactor = (foodPathCommonality / this.stepReferenceScalar);
            const foodProximityTerm = foodProximityFactor * this.foodProximityWeight * (1 + (StateAnalyzer_1.StateAnalyzer.getMyHunger()) / 33);
            ////            SnakeLogger.info("foodProximityTerm is " +  foodProximityTerm + " for path to " + JSON.stringify(path[path.length - 1]));
            let divideMeByLength = 0;
            for (let i = 0; i < path.length; i++) {
                divideMeByLength += StateAnalyzer_1.StateAnalyzer.getDistanceFromCenter(path[i]);
            }
            const averageDistanceFromCenter = divideMeByLength / path.length;
            const centerProximityFactor = 1 - (averageDistanceFromCenter / this.stepReferenceScalar);
            // const distanceFromCenter = StateAnalyzer.getDistanceFromCenter(path[path.length - 1]);
            // const centerProximityFactor = 1 - (distanceFromCenter / this.stepReferenceScalar);
            const centerProximityTerm = centerProximityFactor * this.centreProximityWeight;
            ////            SnakeLogger.info("centerProximityTerm is " +  centerProximityTerm + " for path to " + JSON.stringify(path[path.length - 1]));
            let agressionPathCommonality = 0;
            this.agressionPaths.forEach((agressionPath) => {
                for (let j = 0; j < Math.min(agressionPath.length, path.length); j++) {
                    if (_.isEqual(path[j], agressionPath[j]))
                        agressionPathCommonality++;
                }
            });
            const agressionFactor = (agressionPathCommonality / this.stepReferenceScalar);
            const agressionTerm = agressionFactor * this.agressionWeight;
            ////            SnakeLogger.info("agressionTerm is " +  agressionTerm + " for path to " + JSON.stringify(path[path.length - 1]));
            let nonAvoidancePathCommonality = 0;
            this.suicidePaths.forEach((nonAvoidancePath) => {
                for (let j = 0; j < Math.min(nonAvoidancePath.length, path.length); j++) {
                    if (_.isEqual(path[j], nonAvoidancePath[j]))
                        nonAvoidancePathCommonality++;
                }
            });
            const avoidanceFactor = 1 - (nonAvoidancePathCommonality / this.stepReferenceScalar);
            const avoidanceTerm = avoidanceFactor * this.avoidanceWeight;
            ////            SnakeLogger.info("avoidanceTerm is " +  avoidanceTerm + " for path to " + JSON.stringify(path[path.length - 1]));
            // Add a bias?
            const bias = 0;
            const summedScore = selfProximityTerm + foodProximityTerm + centerProximityTerm + agressionTerm + avoidanceTerm;
            const endMs = new Date().getTime();
            ////            SnakeLogger.info("summedScore for path to endPoint " + JSON.stringify(endPoint) + " is " + summedScore + " (" + (endMs - startMs) + " ms)");
            const result = { path, score: summedScore + bias };
            this.scoredPaths.push(result);
            this.pathsScored++;
            if (result.score > this.currentBestScoredPath.score) {
                ////                SnakeLogger.info("The new best path with a score of " + result.score + " is " + JSON.stringify(result));
                this.currentBestScoredPath = result;
            }
            resolve(result);
        });
    }
};
//# sourceMappingURL=MoveGenerator.js.map