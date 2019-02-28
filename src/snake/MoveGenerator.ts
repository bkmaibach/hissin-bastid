import { StateAnalyzer } from "./StateAnalyzer";
import { request } from "http";
import * as data from "../data/data";
import { SnakeLogger } from "../util/SnakeLogger";
import { TailDodger } from "./TailDodger" ;
import { getIndexOfValue } from "../util/helpers";
import { IGameState,  ECellContents, IMoveInfo, EMoveDirections, IPoint, ISnake, IBoard } from "./types";
import * as _ from "lodash";

export const MoveGenerator = class {
    selfProximityWeight = 1;
    foodProximityWeight = 25;
    centreProximityWeight = 30;
    agressionWeight = 10;
    avoidanceWeight = 10;

    paths: IPoint[][] = [];

    foodPath: IPoint[] = [];
    agressionPath: IPoint[] = [];
    nonAvoidancePath: IPoint[] = [];

    height = StateAnalyzer.getBoardHeight();
    width = StateAnalyzer.getBoardWidth();

    stepReferenceScalar = this.height + this.width;

    constructor() {
        SnakeLogger.info("Constructing MoveGenerator");

    }

    generateMove(): EMoveDirections {
        SnakeLogger.info("Starting generateMove");
        const bestPath = this.bestPath();
        if (typeof bestPath != "undefined") {
            return StateAnalyzer.getMove(bestPath[0], bestPath[1]);
        } else {
            return StateAnalyzer.safeMove();
        }
    }
    async generatePaths(): Promise<void> {
        SnakeLogger.info("Generating all paths");
        const start = StateAnalyzer.getMyPosition();
        const dodger = new TailDodger(start);
        const pathPromises: Promise<IPoint[]>[] = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const end: IPoint = {x, y};
                if (!_.isEqual(end, StateAnalyzer.getMyPosition())) {
                    const pathPromise = dodger.getShortestPath(end);
                    pathPromises.push(pathPromise);
                }
            }
        }
        try {
            this.paths = await Promise.all(pathPromises);
        } catch (e) {
            SnakeLogger.info(e.message);
        }

        this.foodPath = this.filterForFoodPath();
        this.agressionPath = this.filterForAgressionPath();
        this.nonAvoidancePath = this.filterForNonAvoidancePath();
    }

    filterForFoodPath(): IPoint[] {
        SnakeLogger.info("Filtering food paths");
        const foodPoints = StateAnalyzer.getFoodPoints(0);
        const foodPaths = this.paths.filter((path) => {
            const endPoint = path[path.length - 1];
            return getIndexOfValue(foodPoints, endPoint) > -1;
        });
        foodPaths.sort((a, b) => {
            if (a.length < b.length) {
                return -1;
            } else if (a.length > b.length) {
                return 1;
            } else {
                return 0;
            }
        });
        return foodPaths[0];
    }

    filterForAgressionPath(): IPoint[] {
        SnakeLogger.info("Filtering Agression paths");
        const smallerHeadPoints = StateAnalyzer.getSmallerHeadPoints();
        const smallerHeadPaths = this.paths.filter((path) => {
            const endPoint = path[path.length - 1];
            return getIndexOfValue(smallerHeadPoints, endPoint) > -1;
        });
        smallerHeadPaths.sort((a, b) => {
            if (a.length < b.length) {
                return -1;
            } else if (a.length > b.length) {
                return 1;
            } else {
                return 0;
            }
        });
        return smallerHeadPaths[0];
    }

    filterForNonAvoidancePath(): IPoint[] {
        SnakeLogger.info("Filtering Agression paths");
        const largerHeadPoints = StateAnalyzer.getLargerHeadPoints();
        const largerHeadPaths = this.paths.filter((path) => {
            const endPoint = path[path.length - 1];
            return getIndexOfValue(largerHeadPoints, endPoint) > -1;
        });
        largerHeadPaths.sort((a, b) => {
            if (a.length < b.length) {
                return -1;
            } else if (a.length > b.length) {
                return 1;
            } else {
                return 0;
            }
        });
        return largerHeadPaths[0];
    }

    bestPath(): IPoint[] {
        let bestIndex;
        let bestScore = 0;
        for (let i = 0; i < this.paths.length; i++) {
            const score = this.scorePath(this.paths[i]);
            if ( score > bestScore ) {
                bestScore = score;
                bestIndex = i;
            }
        }
        return this.paths[bestIndex];
    }

    scorePath(path: IPoint[]): number {
        const endPoint = path[path.length - 1];
        const selfProximityFactor = 1 - (path.length / this.stepReferenceScalar);
        const selfProximityTerm = selfProximityFactor * this.selfProximityWeight;

        // The following compares the path to all of the food paths, and generates a factor
        // that is larger the more the path overlaps with any of the food paths
        let foodPathCommonality = 0;
        for (let j = 0; j < Math.min(this.foodPath.length, path.length); j++) {
            if (_.isEqual(path[j], this.foodPath[j])) foodPathCommonality++;
        }

        const foodProximityFactor = (foodPathCommonality / this.stepReferenceScalar);
        const foodProximityTerm = foodProximityFactor * this.foodProximityWeight * (1 + (StateAnalyzer.getMyHunger()) / 33);
        SnakeLogger.info("foodProximityTerm is " +  foodProximityTerm);

        let divideMeByLength: number = 0;
        for (let i = 0; i < path.length; i++) {
            divideMeByLength += StateAnalyzer.getDistanceFromCenter(path[i]);
        }
        const averageDistanceFromCenter = divideMeByLength / path.length;
        const centerProximityFactor = 1 - (averageDistanceFromCenter / this.stepReferenceScalar);
        const centerProximityTerm = centerProximityFactor * this.centreProximityWeight;
        SnakeLogger.info("centerProximityTerm is " +  centerProximityTerm);

        let agressionPathCommonality = 0;
        for (let j = 0; j < Math.min(this.agressionPath.length, path.length); j++) {
            if (_.isEqual(path[j], this.agressionPath[j])) agressionPathCommonality++;
        }

        const agressionFactor = (agressionPathCommonality / this.stepReferenceScalar);
        const agressionTerm = agressionFactor * this.agressionWeight;
        SnakeLogger.info("agressionTerm is " +  agressionTerm);

        let nonAvoidancePathCommonality = 0;
        for (let j = 0; j < Math.min(this.nonAvoidancePath.length, path.length); j++) {
            if (_.isEqual(path[j], this.nonAvoidancePath[j])) nonAvoidancePathCommonality++;
        }
        const avoidanceFactor = 1 - (nonAvoidancePathCommonality / this.stepReferenceScalar);
        const avoidanceTerm = avoidanceFactor * this.avoidanceWeight;
        SnakeLogger.info("avoidanceTerm is " +  avoidanceTerm);

        // Add a bias?
        const bias = 0;
        const summedScore = selfProximityTerm + foodProximityTerm + centerProximityTerm + agressionTerm + avoidanceTerm;
        SnakeLogger.info("summedScore for path to endPoint " + endPoint + " is " + summedScore);
        return summedScore + bias;

    }
};