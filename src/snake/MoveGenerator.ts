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

    foodPaths: IPoint[][] = [];
    agressionPaths: IPoint[][] = [];
    nonAvoidancePaths: IPoint[][] = [];

    height = StateAnalyzer.getBoardHeight();
    width = StateAnalyzer.getBoardWidth();

    stepReferenceScalar = this.height + this.width;

    constructor() {
        SnakeLogger.info("Constructing MoveGenerator");
        this.paths = this.generatePaths();
        this.foodPaths = this.generateFoodPaths();
        this.agressionPaths = this.generateAgressionPaths();
        this.nonAvoidancePaths = this.generateNonAvoidancePaths();
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
    generatePaths(): IPoint[][] {
        SnakeLogger.info("Generating all paths");
        const start = StateAnalyzer.getMyPosition();
        const dodger = new TailDodger(start);
        const paths: IPoint[][] = [];
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const end: IPoint = {x, y};
                if (!_.isEqual(end, StateAnalyzer.getMyPosition())) {
                    const path = dodger.getShortestPath(end);
                    if (typeof path != "undefined")  paths.push(path);
                }
            }
        }
        return paths;
    }

    generateFoodPaths(): IPoint[][] {
        SnakeLogger.info("Filtering food paths");
        const foodPoints = StateAnalyzer.getFoodPoints(0);
        const foodPaths = this.paths.filter((path) => {
            const endPoint = path[path.length - 1];
            return getIndexOfValue(foodPoints, endPoint) > -1;
        });
        return foodPaths;
    }

    generateAgressionPaths(): IPoint[][] {
        SnakeLogger.info("Filtering Agression paths");
        const smallerHeadPoints = StateAnalyzer.getSmallerHeadPoints();
        const smallerHeadPaths = this.paths.filter((path) => {
            const endPoint = path[path.length - 1];
            return getIndexOfValue(smallerHeadPoints, endPoint) > -1;
        });
        return smallerHeadPaths;
    }

    generateNonAvoidancePaths(): IPoint[][] {
        SnakeLogger.info("Filtering Agression paths");
        const largerHeadPoints = StateAnalyzer.getLargerHeadPoints();
        const largerHeadPaths = this.paths.filter((path) => {
            const endPoint = path[path.length - 1];
            return getIndexOfValue(largerHeadPoints, endPoint) > -1;
        });
        return largerHeadPaths;
    }

    bestPath(): IPoint[] {
        let bestIndex;
        let bestScore = 0;
        for (let i = 0; i < this.paths.length; i++) {
            SnakeLogger.info("Scoring path " + i + " of " + this.paths.length);
            const score = this.scorePath(this.paths[i]);
            if ( score > bestScore ) {
                bestScore = score;
                bestIndex = i;
            }
        }
        return this.paths[bestIndex];
    }

    scorePath(path: IPoint[]): number {
        const selfProximityFactor = 1 - (path.length / this.stepReferenceScalar);
        const selfProximityTerm = selfProximityFactor * this.selfProximityWeight;

        // The following compares the path to all of the food paths, and generates a factor
        // that is larger the more the path overlaps with any of the food paths
        let foodPathCommonality = 0;
        for (let i = 0; i < this.foodPaths.length; i++) {
            const smallerLength = Math.min(this.foodPaths.length, path.length);
            for (let j = 0; j < smallerLength; j++) {
                if (_.isEqual(path[j], this.foodPaths[i][j])) foodPathCommonality++;
            }
        }
        const foodProximityFactor = (foodPathCommonality / this.stepReferenceScalar);
        const foodProximityTerm = foodProximityFactor * this.foodProximityWeight * (1 + (StateAnalyzer.getMyHunger()) / 33);


        let divideMeByLength: number = 0;
        for (let i = 0; i < path.length; i++) {
            divideMeByLength += StateAnalyzer.getDistanceFromCenter(path[i]);
        }
        const averageDistanceFromCenter = divideMeByLength / path.length;
        const centerProximityFactor = 1 - (averageDistanceFromCenter / this.stepReferenceScalar);
        const centerProximityTerm = centerProximityFactor * this.centreProximityWeight;

        let agressionPathCommonality = 0;
        for (let i = 0; i < this.agressionPaths.length; i++) {
            const smallerLength = Math.min(this.agressionPaths.length, path.length);
            for (let j = 0; j < smallerLength; j++) {
                if (_.isEqual(path[j], this.agressionPaths[i][j])) agressionPathCommonality++;
            }
        }
        const agressionFactor = (agressionPathCommonality / this.stepReferenceScalar);
        const agressionTerm = agressionFactor * this.agressionWeight;

        let nonAvoidancePathCommonality = 0;
        for (let i = 0; i < this.nonAvoidancePaths.length; i++) {
            const smallerLength = Math.min(this.nonAvoidancePaths.length, path.length);
            for (let j = 0; j < smallerLength; j++) {
                if (_.isEqual(path[j], this.nonAvoidancePaths[i][j])) nonAvoidancePathCommonality++;
            }
        }
        const avoidanceFactor = 1 - (nonAvoidancePathCommonality / this.stepReferenceScalar);
        const avoidanceTerm = avoidanceFactor * this.avoidanceWeight;

        // Add a bias?
        const bias = 0;

        return selfProximityTerm + foodProximityTerm + centerProximityTerm + agressionTerm + avoidanceTerm + bias;

    }
};